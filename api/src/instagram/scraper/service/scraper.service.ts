import { AxiosProxyConfig } from 'axios';
import { Injectable, Logger } from "@nestjs/common";
import { CookieHandler } from "src/helper/CookieHandler";
import { InsScraperServiceFactory, InstaFetcher } from "./ins-scraper-factory";
import { ProxyService } from "src/instagram/proxy/proxy.service";
import { Channel } from "src/instagram/entity/channel.entity";
import { ScrapeUserProfileFailed } from 'src/exception/scrape-user-profile.exception';
import { UserGraphQlV2, mapUserGraphQLToChannel } from '../types/UserGraphQlV2';
import BatchHelper from 'src/helper/BatchHelper';
import { sleep } from 'src/pptr-crawler/utils/Utils';

@Injectable()
export default class ScraperService {
    private readonly logger = new Logger(ScraperService.name);

    constructor(private readonly cookieHandler: CookieHandler,
        private readonly scraperServiceFactory: InsScraperServiceFactory,
        private readonly proxyService: ProxyService
    ) {

    }

    async scrapeUserProfile(username: string, options: { cookies?: string, proxy?: AxiosProxyConfig } = {}): Promise<Channel> {
        if (!options.cookies) options.cookies = this.convertToRightFormat(this.cookieHandler.getAsText('instagram', 'default.json'));

        const instaFetcher: InstaFetcher = InsScraperServiceFactory.create(
            options.cookies,
            { proxy: options.proxy ?? false });
        let channel: Channel;
        try {
            channel = mapUserGraphQLToChannel(await instaFetcher.fetchUser(username) as UserGraphQlV2)
            this.logger.log(`Scraper user profile: ${username} successfully`)
        } catch (error) {
            this.logger.log(`Scrape user profile: ${username} failed, ${error["name"]}: ${error["message"]}`);
            throw new ScrapeUserProfileFailed(username)
        }
        return channel;
    }

    async scrapeUserProfiles(usernames: string[]): Promise<Channel[]> {
        const MAX_FETCH_BATCH = 20
        const usernameBatches: string[][] = BatchHelper.createBatches<string>(usernames, MAX_FETCH_BATCH);

        const cookieStrs: string[] = await this.cookieHandler.getAllCookies('instagram');
        const rotatingProxy: AxiosProxyConfig = {
            protocol: "http",
            host: "103.179.173.13",
            port: 11001,
        }
        let channels: Channel[] = [];
        let usernamesScrapeFailed: string[] = [];

        for (const usernameBatch of usernameBatches) {
            const cookies = this.convertToRightFormat(cookieStrs[0]);
            for (const username of usernameBatch) {
                try {
                    const channel: Channel = await this.scrapeUserProfile(username, {
                        cookies,
                        proxy: rotatingProxy
                    })
                    channels.push(channel)
                    await sleep(1)
                } catch (error) {
                    if (error instanceof ScrapeUserProfileFailed) {
                        usernamesScrapeFailed.push(username);
                    }
                    break;
                }
            }
            await sleep(180);
        }
        return channels;
    }

    private convertToRightFormat(cookies: string): string {
        return JSON.stringify({
            cookie: JSON.parse(cookies)
        })
    }
}