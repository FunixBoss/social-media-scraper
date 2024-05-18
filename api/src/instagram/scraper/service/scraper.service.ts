import axios, { AxiosProxyConfig } from 'axios';
import { Injectable, Logger } from "@nestjs/common";
import { CookieHandler } from "src/helper/CookieHandler";
import { InsScraperServiceFactory, InstaFetcher } from "./ins-scraper-factory";
import { Channel } from "src/instagram/entity/channel.entity";
import { UserGraphQlV2, mapUserGraphQLToChannel } from '../types/UserGraphQlV2';
import BatchHelper from 'src/helper/BatchHelper';
import { sleep } from 'src/pptr/utils/Utils';
import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { RotatingProxyIpv4Service } from 'src/proxy/rotating-proxy-ipv4/service/rotating-proxy-ipv4.service';
import RotatingProxyIpv4DTO from 'src/proxy/rotating-proxy-ipv4/dto/proxy.dto';
import RotatingProxyIpv4MapperService from 'src/proxy/rotating-proxy-ipv4/service/rotating-proxy-ipv4-mapper.service';
import { AllProxiesDie } from 'src/exception/all-proxies-die.exception';

export type ScrapeConfig = {
    batchSize: number,
}

export const scrapeConfig: ScrapeConfig = {
    batchSize: 15
}

export type ScrapeProfilesResult = {
    channels: Channel[],
    scrapeFailedUsernames: string[]
}

@Injectable()
export default class ScraperService {
    private readonly logger = new Logger(ScraperService.name);

    constructor(private readonly cookieHandler: CookieHandler,
        private readonly scraperServiceFactory: InsScraperServiceFactory,
        private readonly proxyService: RotatingProxyIpv4Service,
        private readonly proxyMapper: RotatingProxyIpv4MapperService,
        private readonly configService: ConfigService,
    ) { }

    async checkPort() {
        const START_PORT = 10000;
        const END_PORT = 11500;
        const chunkSize = 1000;
        const host = "103.179.173.13"

        const ports = Array.from({ length: END_PORT - START_PORT + 1 }, (_, i) => i + START_PORT);
        const checkPortRange = async (portRange) => {
            const portPromises = portRange.map(async (port) => {
                try {
                    const proxyUrl = `http://:@${host}:${port}`;
                    const agent = new HttpsProxyAgent(proxyUrl);
                    const response = await axios.get('http://httpbin.org/ip', { httpAgent: agent, timeout: 5000 });
                    if (response.data["origin"]) {
                        this.logger.log(`Check port successfully: ${port}`);
                    }
                } catch (error) {
                    this.logger.warn(`Check port failed: ${port} - ${error["name"]} - ${error["message"]}`);
                }
            });
            await Promise.all(portPromises);
        };

        for (let i = 0; i < ports.length; i += chunkSize) {
            const portRange = ports.slice(i, i + chunkSize);
            await checkPortRange(portRange);
        }
    }

    async scrapeUserProfile(username: string, options: {
        log?: boolean,
        cookies?: string,
        proxy?: AxiosProxyConfig
    } = {
            log: true,
            cookies: this.convertToRightFormat(this.cookieHandler.getAsText('instagram', 'incognito.json')),
            proxy: {
                protocol: 'http',
                host: this.configService.get<string>("PROXY_ROTATING").split(":").at(0),
                port: +this.configService.get<string>("PROXY_ROTATING").split(":").at(1),
            }
        }): Promise<Channel> {
        const instaFetcher: InstaFetcher = InsScraperServiceFactory.create(
            options.cookies,
            { proxy: options.proxy ?? false });
        let channel: Channel;
        try {
            channel = mapUserGraphQLToChannel(await instaFetcher.fetchUser(username) as UserGraphQlV2)
            if (options.log) this.logger.log(`Scraper user profile: ${username} successfully`)
        } catch (error) {
            if (options.log) this.logger.error(`Scrape user profile: ${username} failed, ${error["name"]}: ${error["message"]}`);
            throw error
        }
        return channel; 
    }

    async scrapeUserProfiles(usernames: string[]): Promise<ScrapeProfilesResult> {
        await this.proxyService.checkAll();
        const rotatingProxies: RotatingProxyIpv4DTO[] = await this.proxyService.findAll({ status: 'live' });
        if (rotatingProxies.length == 0) throw new AllProxiesDie();
        // else await this.proxyService.waitUntilProxiesChangeIp(rotatingProxies, { log: true });

        const usernameBatchesByProxies: string[][] = BatchHelper.createBatches<string>(usernames, { totalBatch: rotatingProxies.length });
        const totalUsername: number = usernames.length;
        let numberOfCrawled: number = 0;
        let result: ScrapeProfilesResult = {
            channels: [],
            scrapeFailedUsernames: []
        };

        this.logger.verbose(`Total Username Batches/Proxy: ${usernameBatchesByProxies.length}`);

        const scrapeBatch = async (index: number, usernameBatchesByProxy: string[]) => {
            const proxy: RotatingProxyIpv4DTO = rotatingProxies[index];

            let batchResult: ScrapeProfilesResult = {
                channels: [],
                scrapeFailedUsernames: []
            };

            const axiosProxyConfig: AxiosProxyConfig = { protocol: 'http', host: proxy.ip, port: proxy.port };
            const usernameBatches: string[][] = BatchHelper.createBatches<string>(usernameBatchesByProxy, { batchSize: scrapeConfig.batchSize });

            for (const [index, usernameBatch] of usernameBatches.entries()) {
                if (index == 0) await this.proxyService.waitUntilProxyChangeIp(proxy, { log: true })

                const scrapePromises = usernameBatch.map(async (username) => {
                    try {
                        batchResult.channels.push(await this.scrapeUserProfile(username, { log: false, proxy: axiosProxyConfig }));
                        this.logger.log(`Proxy ${proxy.ip}:${proxy.port} - Batch ${index + 1} - Scrape user profile successfully (${++numberOfCrawled}/${totalUsername}): ${username}`);
                        await sleep(1);
                    } catch (error) {
                        this.logger.warn(`Proxy ${proxy.ip}:${proxy.port} - Batch ${index} - Scrape user profile failed (${++numberOfCrawled}/${totalUsername}): ${username}, ${error["name"]}: ${error["message"]}`);
                        batchResult.scrapeFailedUsernames.push(username);
                    }
                });

                await Promise.all(scrapePromises);
                if (index == usernameBatches.length - 1) break;

                this.logger.verbose(`Waiting for next IP rotation of proxy ${proxy.ip}:${proxy.port}...`);
                await this.proxyService.waitUntilProxyChangeIp(proxy, { log: true })
            }
            return batchResult;
        };

        const batchResults = await Promise.all(
            usernameBatchesByProxies.map((usernameBatch, index) => scrapeBatch(index, usernameBatch)));

        for (const batchResult of batchResults) {
            result.channels.push(...batchResult.channels);
            result.scrapeFailedUsernames.push(...batchResult.scrapeFailedUsernames);
        }

        this.logger.log(`Scrape profiles result: (${totalUsername - result.scrapeFailedUsernames.length}/${totalUsername}) success - (${result.scrapeFailedUsernames.length}/${totalUsername}) fail`);
        return result;
    }

    private convertToRightFormat(cookies: string): string {
        return JSON.stringify({
            cookie: JSON.parse(cookies)
        })
    }
}