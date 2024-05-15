import axios, { AxiosProxyConfig } from 'axios';
import { Injectable, Logger } from "@nestjs/common";
import { CookieHandler } from "src/helper/CookieHandler";
import { InsScraperServiceFactory, InstaFetcher } from "./ins-scraper-factory";
import { Channel } from "src/instagram/entity/channel.entity";
import { ScrapeUserProfileFailed } from 'src/exception/scrape-user-profile.exception';
import { UserGraphQlV2, mapUserGraphQLToChannel } from '../types/UserGraphQlV2';
import BatchHelper from 'src/helper/BatchHelper';
import { sleep } from 'src/pptr/utils/Utils';
import { ProxyService } from 'src/proxy/proxy.service';
import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';

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
        private readonly proxyService: ProxyService,
        private readonly configService: ConfigService
    ) { }

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
            this.logger.error(`Scrape user profile: ${username} failed, ${error["name"]}: ${error["message"]}`);
            throw new ScrapeUserProfileFailed(username)
        }
        return channel;
    }

    async scrapeUserProfiles(usernames: string[]): Promise<ScrapeProfilesResult> {
        const usernameBatches: string[][] = BatchHelper.createBatches<string>(usernames, scrapeConfig.batchSize);

        let result: ScrapeProfilesResult = {
            channels: [],
            scrapeFailedUsernames: []
        }
        const totalUsername: number = usernames.length;
        let numberOfCrawled: number = 0;
        const [host, port] = this.configService.get<string>("PROXY_ROTATING").split(":");
        let previousIp: string = await this.getCurrentIp({ host, port: +port });
        this.logger.verbose(`Current IP: ${previousIp}`);

        const axiosProxyConfig: AxiosProxyConfig = {
            protocol: 'http',
            host,
            port: +port,
        };

        // should check if IP has changed or not
        for (const usernameBatch of usernameBatches) {
            for (const username of usernameBatch) {
                try {
                    result.channels.push(await this.scrapeUserProfile(username, { log: false, proxy: axiosProxyConfig }));
                    this.logger.log(`Scrape user profile (${++numberOfCrawled}/${totalUsername}): ${username} successfully`)
                    await sleep(1);
                } catch (error) {
                    if (error instanceof ScrapeUserProfileFailed) {
                        result.scrapeFailedUsernames.push(username);
                    }
                    continue;
                }
            }

            this.logger.verbose(`Waiting for next IP rotation...`);
            let currentIp: string;
            do {
                try {
                    currentIp = await this.getCurrentIp({ host, port: +port });
                    if (currentIp === previousIp) {
                        await sleep(5);
                    }
                } catch (error) {
                    this.logger.warn(`Ger Current Ip Error: ${error["name"]} - ${error["message"]}`);
                }
            } while (currentIp === previousIp);

            this.logger.verbose(`IP changed to ${currentIp}`);
            previousIp = currentIp; // Update the previous IP to the new IP
        }
        this.logger.log(`Scrape (${numberOfCrawled}/${totalUsername}) user profiles successfully - (${result.scrapeFailedUsernames.length}/${totalUsername}) failed`)
        return result;
    }

    private async getCurrentIp(rotatingProxy: { host: string, port: number }): Promise<string> {
        const proxyUrl = `http://:@${rotatingProxy.host}:${rotatingProxy.port}`;
        const agent = new HttpsProxyAgent(proxyUrl);
        const response = await axios.get('http://httpbin.org/ip', { httpAgent: agent, timeout: 5000 });
        return response.data["origin"]
    }

    private convertToRightFormat(cookies: string): string {
        return JSON.stringify({
            cookie: JSON.parse(cookies)
        })
    }
}