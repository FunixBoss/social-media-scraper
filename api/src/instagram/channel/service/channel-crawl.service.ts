import { Injectable } from "@nestjs/common";
import { InjectBrowser, InjectPage } from "nestjs-puppeteer";
import { Browser, BrowserContext, Page, TimeoutError } from "puppeteer";
import { RequestInterceptionManager } from "puppeteer-intercept-and-modify-requests";
import { ChannelPost } from "src/instagram/entity/channel-post.entity";
import { ChannelReel } from "src/instagram/entity/channel-reel.entity";
import { Channel } from "src/instagram/entity/channel.entity";
import { InsAPIWrapper } from "src/pptr-crawler/types/ins/InsAPIWrapper";
import { InsFriendshipUserFull } from "src/pptr-crawler/types/ins/InsFriendship";
import { InsPostsFull, mapInsPosts } from "src/pptr-crawler/types/ins/InsPosts";
import { InsProfileFull, mapInsProfile } from "src/pptr-crawler/types/ins/InsProfile";
import { InsReelsFull, mapInsReels } from "src/pptr-crawler/types/ins/InsReels";
import { sleep } from "src/pptr-crawler/utils/Utils";
import { PptrPageConfig } from '../../../pptr-crawler/service/pptr-page-config.service';
import CrawlConfig from "../config/crawl-config";
import { scrollPageToBottom, scrollPageToTop } from "../utils/scroll";

@Injectable()
export default class ChannelCrawlService {
    private interceptManager: RequestInterceptionManager
    private readonly baseUrl = 'https://instagram.com'

    constructor(
        @InjectBrowser('social-media-scraper') private readonly browser: Browser,
        @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
        private readonly pptrPageConfig: PptrPageConfig
    ) {
        this.setUpDefaultPageInterceptors()
    }

    private async setUpDefaultPageInterceptors(): Promise<void> {
        this.interceptManager = new RequestInterceptionManager(
            await this.page.target().createCDPSession() as any,
            {
                onError: (error) => {
                    console.error('Request interception error:', error)
                },
            }
        )
    }

    private async setUpPageInterceptors(page: Page): Promise<RequestInterceptionManager> {
        return new RequestInterceptionManager(
            await page.target().createCDPSession() as any,
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
        const MAX_BATCH_SIZE = 5;

        const usernameBatches: string[][] = [];
        for (let i = 0; i < usernames.length; i += MAX_BATCH_SIZE) {
            usernameBatches.push(usernames.slice(i, i + MAX_BATCH_SIZE));
        }
        const context: BrowserContext = this.browser.browserContexts().at(1)
        await this.pptrPageConfig.createPages(context, MAX_BATCH_SIZE);
        const pages: Page[] = await context.pages()

        const channelsMap = new Map();
        for (const usernameBatch of usernameBatches) {
            const promises = usernameBatch.map(async (username, index) => {
                console.log(`index: ${index + 1} - username: ${username}`);

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
                                console.log(`==> Found Response: User Profile - ${username}`);
                                if (!channelsMap.has(username) && (dataObj.data as InsProfileFull).user?.follower_count >= CrawlConfig.MIN_CHANNEL_FOLLOWER) {
                                    channelsMap.set(username, mapInsProfile(dataObj.data as InsProfileFull))
                                }
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
                await page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' });
                await interceptManager.clear()
            });

            // Wait for all pages in the batch to complete their operations
            await Promise.all(promises).then(() => {
                console.log('All pages in this batch have completed their navigations.');
            }).catch(error => {
                console.error('An error occurred with processing a batch:', error);
            });
        }
        pages.shift()
        await Promise.all(pages.map(p => p.close()))
        return Array.from(channelsMap.values());
    }

    async crawlProfile(username: string): Promise<Channel> {
        let channel: Channel;
        await this.interceptManager.intercept(
            {
                urlPattern: `https://www.instagram.com/api/graphql`,
                resourceType: 'XHR',
                modifyResponse: async ({ body }) => {
                    try {
                        const dataObj: InsAPIWrapper = JSON.parse(body);
                        if (!dataObj.data) return;

                        if (dataObj.data["user"]) {
                            console.log(`==> Found Response: User Profile - ${username}`);
                            channel = mapInsProfile(dataObj.data as InsProfileFull)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            })
        await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'load' })
        await sleep(1)
        await this.interceptManager.clear()
        return channel;
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
        await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
        await sleep(1.5)
        await this.interceptManager.clear()
        return friendshipUsernames
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
                        console.log(`==> Found Response: Posts - ${username}`);
                        const insPostFull: InsPostsFull = dataObj.data as InsPostsFull
                        const pagedPosts: ChannelPost[] = await mapInsPosts(insPostFull);
                        posts.push(...pagedPosts);
                        len += pagedPosts.length
                        console.log(len);
                        const hasNextPage = insPostFull.xdt_api__v1__feed__user_timeline_graphql_connection.page_info.has_next_page
                        console.log(`hasNextPage: ${hasNextPage}`);
                        if (!hasNextPage) {
                            scanComplete = true;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })
        await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'load', timeout: 15000 })
        while (!scanComplete) {
            await scrollPageToTop(this.page, {size: 250, delay: 10, stepsLimit: 3})
            await scrollPageToBottom(this.page)
        }
        console.log("Scanned All Posts")
        await this.interceptManager.clear()
        for (let i = len; i > 0; i--) {
            let post: ChannelPost = posts[i - 1];
            post.channel_post_numerical_order = i;
            post.channel = { username: username }
        }
        return posts;
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
                        console.log("==> Found Graphql Request: Reels");
                        const insReelsFull: InsReelsFull = dataObj.data as InsReelsFull
                        const pagedReels: ChannelReel[] = mapInsReels(insReelsFull)
                        reels.push(...pagedReels)
                        reelLen += pagedReels.length
                        console.log(reelLen);
                        
                        const hasNextPage = insReelsFull.xdt_api__v1__clips__user__connection_v2.page_info.has_next_page
                        console.log(`hasNextPage: ${hasNextPage}`);
                        if (!hasNextPage) {
                            scanComplete = true;
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            },
        })
        await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'load' })
        while (!scanComplete) {
            await scrollPageToTop(this.page, {size: 250, delay: 10, stepsLimit: 3})
            await scrollPageToBottom(this.page)
        }
        for (let i = 0; i < reelLen; i++) {
            let reel: ChannelReel = reels[i];
            reel.channel_reel_numerical_order = reelLen - i;
            reel.channel = { username: username }
        }
        return reels;
    }

}
