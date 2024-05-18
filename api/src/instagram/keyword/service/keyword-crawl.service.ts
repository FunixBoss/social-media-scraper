import { Injectable, Logger } from "@nestjs/common";
import { InjectPage } from "nestjs-puppeteer";
import { Page } from "puppeteer";
import { RequestInterceptionManager } from "puppeteer-intercept-and-modify-requests";
import { Channel } from "src/instagram/entity/channel.entity";
import { Hashtag } from "src/instagram/entity/hashtag.entity";
import { Keyword } from "src/instagram/entity/keyword.entity";
import { InsAPIWrapper } from "src/pptr/types/ins/InsAPIWrapper";
import { InsSearching, mapInsHashtag, mapInsSearchChannel } from "src/pptr/types/ins/InsSearch";
import { sleep } from "src/pptr/utils/Utils";

@Injectable()
export default class KeywordCrawlService {
    private readonly logger = new Logger(KeywordCrawlService.name);
    private interceptManager: RequestInterceptionManager

    constructor(
        @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
    ) {
        this.setUpPageInterceptors()
    }

    private async setUpPageInterceptors(): Promise<void> {
        this.interceptManager = new RequestInterceptionManager(
            (await this.page.target().createCDPSession()) as any,
            {
                onError: (error) => {
                    console.error('Request interception error:', error)
                },
            }
        )
    }

    async crawlHashtags(keyword: Keyword): Promise<Hashtag[]> {
        let hashtags: Hashtag[] = [];
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
                        hashtags = mapInsHashtag(dataObj.data as InsSearching);
                        this.logger.log(`Crawl hashtags successfully, keyword: ${keyword.name} - hastags: ${hashtags.length}`);
                    }
                } catch (error) {
                    this.logger.log(`Crawl hashtags failed, keyword: ${keyword.name}, Error: ${error["name"]} - ${error["message"]}`);
                }
            }
        })
        await this.page.goto('https://instagram.com/', { waitUntil: 'networkidle2' });
        await this.page.evaluate(`document.querySelectorAll('span[aria-describedby^=":r"] a')[1].click()`);
        await this.page.type('input[aria-label^="Search"]', `#${keyword.name}`);
        await sleep(3);
        return hashtags;
    }

    async crawlUsernames(keyword: Keyword): Promise<string[]> {
        let channels: Channel[] = [];
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
                        channels = mapInsSearchChannel(dataObj.data as InsSearching);
                        this.logger.log(`Crawl usernames successfully, keyword: ${keyword.name} - channels: ${channels.length}`);
                    }
                } catch (error) {
                    this.logger.log(`Crawl usernames failed, keyword: ${keyword.name}, Error: ${error["name"]} - ${error["message"]}`);
                }
            }
        })
        await this.page.goto('https://instagram.com/', { waitUntil: 'networkidle2' });
        await this.page.evaluate(`document.querySelectorAll('span[aria-describedby^=":r"] a')[1].click()`);
        await this.page.type('input[aria-label^="Search"]', `${keyword.name}`);
        await sleep(3);
        return channels.map(ch => ch.username);
    }
}