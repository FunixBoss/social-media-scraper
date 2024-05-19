import { Injectable, Logger } from "@nestjs/common";
import { Browser, BrowserContext, Page } from "puppeteer";
import { RequestInterceptionManager } from "puppeteer-intercept-and-modify-requests";
import { ChannelPost } from "src/instagram/entity/channel-post.entity";
import { ChannelReel } from "src/instagram/entity/channel-reel.entity";
import { Channel } from "src/instagram/entity/channel.entity";
import { InsAPIWrapper } from "src/pptr/types/ins/InsAPIWrapper";
import { InsFriendshipUserFull } from "src/pptr/types/ins/InsFriendship";
import { InsPostsFull, mapInsPosts } from "src/pptr/types/ins/InsPosts";
import { InsProfileFull, mapInsProfile } from "src/pptr/types/ins/InsProfile";
import { InsReelsFull, mapInsReels } from "src/pptr/types/ins/InsReels";
import { sleep } from "src/pptr/utils/Utils";
import { scrollPageToBottom, scrollPageToTop } from "../utils/scroll";
import { INS_URL } from "src/pptr/config/social-media.config";
import { InjectBrowser, InjectPage } from "nestjs-puppeteer";
import { PptrPageService } from "src/pptr/service/pptr-page.service";
import BatchHelper from "src/helper/BatchHelper";
import { ConfigService } from "@nestjs/config";
import { ChannelCrawlConfig } from "src/config/crawl-settings.type";

@Injectable()
export default class ChannelCrawlService {
    private interceptManager: RequestInterceptionManager
    private readonly logger = new Logger(ChannelCrawlService.name);
    private readonly crawlConfig: ChannelCrawlConfig

    constructor(
        @InjectBrowser('social-media-scraper') private readonly browser: Browser,
        @InjectBrowser('instagram-login') private readonly browser2: Browser,
        @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
        private readonly pageService: PptrPageService,
        private readonly configService: ConfigService,
    ) {
        this.crawlConfig = configService.get<ChannelCrawlConfig>('channel')
        this.setUpDefaultPageInterceptors()
    }

    private async setUpDefaultPageInterceptors(): Promise<void> {
        this.interceptManager = new RequestInterceptionManager(
            await this.page.createCDPSession() as any,
            {
                onError: (error) => {
                    console.error('Request interception error:', error)
                },
            }
        )
    }

    private async setUpPageInterceptors(page: Page): Promise<RequestInterceptionManager> {
        return new RequestInterceptionManager(
            await page.createCDPSession() as any,
            {
                onError: (error) => {
                    console.error('Request interception error:', error)
                },
            }
        )
    }

    private async hasReelsTab(): Promise<boolean> {
        return await this.page.$$eval(
            "div[role='tablist'] a",
            (anchors: HTMLAnchorElement[]) => {
                const hrefs: string[] = anchors.map(a => a.href)
                return hrefs.filter(href => href.includes("reels")).length > 0
            }
        )
    }

    async crawlProfiles(usernames: string[]): Promise<Channel[]> { 
        const usernameLen = usernames.length;
        let numberOfCrawled = 0;
        const { batchSize, timeBetweenBatch } = this.crawlConfig.friendships;

        const usernameBatches: string[][] = BatchHelper.createBatches(usernames, { batchSize });
        const context: BrowserContext = this.browser2.defaultBrowserContext()
        await this.pageService.createPages(context, { number: batchSize });
        const pages: Page[] = await context.pages()

        const channelsMap = new Map();
        for (const usernameBatch of usernameBatches) {
            const promises = usernameBatch.map(async (username, index) => {
                const page = pages[index + 1];  // Ensure this is correctly assigned based on your pages array
                const interceptManager = await this.setUpPageInterceptors(page);
                await interceptManager.intercept({
                    urlPattern: `https://www.instagram.com/api/graphql`,
                    resourceType: 'XHR',
                    modifyResponse: async ({ body }) => {
                        try {
                            const dataObj: InsAPIWrapper = JSON.parse(body);
                            if (!dataObj.data) return;

                            if (dataObj.data["user"]) {
                                if (!channelsMap.has(username)) {
                                    channelsMap.set(username, mapInsProfile(dataObj.data as InsProfileFull))
                                }
                                this.logger.log(`Crawled profile successfully (${++numberOfCrawled}/${usernameLen}): ${username} ${numberOfCrawled != usernameLen ? 'wait ' + timeBetweenBatch + 's for next crawl' : ''} `);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
                try {
                    await page.goto(`${INS_URL}/${username}`, { waitUntil: 'load', timeout: 10000 });
                    await sleep(1)
                } catch (error) {
                    this.logger.warn(`Crawled: username: ${username} ERROR - SKIP`);
                } finally {
                    interceptManager.clear()
                }
                await sleep(timeBetweenBatch)
            });
 
            // Wait for all pages in the batch to complete their operations
            await Promise.all(promises).then(() => {
                this.logger.log('All pages in this batch have completed their navigations.');
            }).catch(error => {
                this.logger.warn('An error occurred with processing a batch:', error);
            });
        }
        pages.shift()
        await Promise.all(pages.map(p => p.close()))
        return Array.from(channelsMap.values());
    }

    async crawlProfile(username: string): Promise<Channel> {
        let channel: Channel;
        let scanComplete: boolean = false;

        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (!dataObj.data) return;

                    if (dataObj.data["user"]) {
                        channel = mapInsProfile(dataObj.data as InsProfileFull);
                        scanComplete = true;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        });

        const waitForScanComplete = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (!scanComplete) reject(new Error('Scan did not complete within 5 seconds'));
            }, 5000); // 5 seconds timeout

            const interval = setInterval(() => {
                if (scanComplete) {
                    clearTimeout(timeout);
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100); // Check every 100ms
        });

        try {
            await this.page.goto(`${INS_URL}/${username}`, { waitUntil: 'load', timeout: this.crawlConfig.profile.timeout });
            await Promise.race([waitForScanComplete]);
            if (!scanComplete) {
                throw new Error('Scan did not complete within the allowed time');
            }
            return channel;
        } catch (error) {
            throw error;
        } finally {
            await this.interceptManager.clear();
        }
    }

    async crawlFriendships(username: string): Promise<string[]> {
        let friendshipUsernames: string[] = [];
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (!dataObj.data) return;

                    if (dataObj.data["xdt_api__v1__discover__chaining"]) {
                        console.log(`==> Found Response: Friendship Users - ${username}`);
                        const friendshipUserApis = dataObj.data as InsFriendshipUserFull
                        friendshipUsernames = friendshipUserApis.xdt_api__v1__discover__chaining.users.map(user => user.username);
                    }
                } catch (error) {
                    console.log(error);
                }
            } 
        });
        try {
            await this.page.goto(`${INS_URL}/${username}`, { waitUntil: 'load' })
            await sleep(3)
            console.log(friendshipUsernames.join(","));
            return friendshipUsernames
        } catch (error) {
            throw error;
        } finally {
            await this.interceptManager.clear()
        }
    }

    async crawlPosts(username: string): Promise<ChannelPost[]> {
        let posts: ChannelPost[] = [];
        let len: number = 0;
        let scanComplete = false;
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
                        const insPostFull: InsPostsFull = dataObj.data as InsPostsFull
                        const pagedPosts: ChannelPost[] = await mapInsPosts(insPostFull);
                        posts.push(...pagedPosts);
                        len += pagedPosts.length
                        const hasNextPage = insPostFull.xdt_api__v1__feed__user_timeline_graphql_connection.page_info.has_next_page
                        this.logger.log(`Crawl posts successfully: ${len} - hasNextPage: ${hasNextPage}`);
                        if (!hasNextPage) {
                            scanComplete = true;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })
        try {
            await this.page.goto(`${INS_URL}/${username}`, { waitUntil: 'load', timeout: this.crawlConfig.profile.timeout })
            while (!scanComplete) {
                await scrollPageToTop(this.page, { size: 250, delay: 10, stepsLimit: 3 })
                await scrollPageToBottom(this.page)
            }
            for (let i = len; i > 0; i--) {
                let post: ChannelPost = posts[i - 1];
                post.channel_post_numerical_order = i;
                post.channel = { username: username }
            }
            this.logger.log(`Crawled All Posts Of Username: ${username}`)
            return posts;
        } catch (error) {
            throw error
        } finally {
            await this.interceptManager.clear()
        }
    }

    async crawlReels(username: string): Promise<ChannelReel[]> {
        let reels: ChannelReel[] = [];
        let reelLen: number = 0;
        let scanComplete = false;

        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/graphql/query`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj && dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
                        const insReelsFull: InsReelsFull = dataObj.data as InsReelsFull
                        const pagedReels: ChannelReel[] = mapInsReels(insReelsFull)
                        reels.push(...pagedReels)
                        reelLen += pagedReels.length

                        const hasNextPage = insReelsFull.xdt_api__v1__clips__user__connection_v2.page_info.has_next_page
                        this.logger.log(`Crawl posts successfully: ${reelLen} - hasNextPage: ${hasNextPage}`);
                        if (!hasNextPage) {
                            scanComplete = true;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            },
        })
        try {
            await this.page.goto(`${INS_URL}/${username}/reels`, { waitUntil: 'load', timeout: this.crawlConfig.profile.timeout })
            while (!scanComplete) {
                await scrollPageToTop(this.page, { size: 250, delay: 10, stepsLimit: 3 })
                await scrollPageToBottom(this.page)
            }
            for (let i = 0; i < reelLen; i++) {
                let reel: ChannelReel = reels[i];
                reel.channel_reel_numerical_order = reelLen - i;
                reel.channel = { username: username }
            }
            return reels;
        } catch (error) {
            throw error;
        } finally {
            this.interceptManager.clear()
        }
    }

}
