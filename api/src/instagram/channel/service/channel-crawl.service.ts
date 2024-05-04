import { Injectable } from "@nestjs/common";
import { InjectBrowser, InjectPage } from "nestjs-puppeteer";
import { Browser, Page, TimeoutError } from "puppeteer";
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
        const MAX_BATCH_SIZE = 2;

        const usernameBatches: string[][] = [];
        for (let i = 0; i < usernames.length; i += MAX_BATCH_SIZE) {
            usernameBatches.push(usernames.slice(i, i + MAX_BATCH_SIZE));
        }
        await this.pptrPageConfig.createPages(MAX_BATCH_SIZE)
        const pages: Page[] = await this.browser.pages()

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
                                if (!channelsMap.has(username)) {
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
        await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
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
        let len: number = 0
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/api/graphql`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
                        console.log(`==> Found Response: Posts - ${username}`);
                        const pagedPosts: ChannelPost[] = await mapInsPosts(dataObj.data as InsPostsFull);
                        posts.push(...pagedPosts);
                        len += pagedPosts.length
                        console.log(len);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })
        await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle0' })
        try {
            await scrollToBottom(this.page);
        } catch (error) {
            if (error instanceof TimeoutError) {
                console.log("Scanned All Posts")
            }
            await this.interceptManager.clear()
        };
        for (let i = len; i > 0; i--) {
            let post: ChannelPost = posts[i - 1];
            post.channel_post_numerical_order = i;
            post.channel = { username: username }
        }
        return posts;
    }

    async crawlReels(username: string): Promise<ChannelReel[]> {
        let reels: ChannelReel[] = [];
        let reelLen: number = 0
        await this.interceptManager.intercept({
            urlPattern: `https://www.instagram.com/graphql/query`,
            resourceType: 'XHR',
            modifyResponse: async ({ body }) => {
                try {
                    const dataObj: InsAPIWrapper = JSON.parse(body);
                    if (dataObj && dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
                        console.log("==> Found Graphql Request: Reels");
                        const pagedReels: ChannelReel[] = mapInsReels(dataObj.data as InsReelsFull)
                        reels.push(...pagedReels)
                        reelLen += pagedReels.length
                        console.log(reelLen);
                    }
                } catch (error) {
                    console.log(error);
                }
            },
        })
        await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'networkidle2' })
        if (!await this.hasReelsTab()) {
            console.log("Do not have any reels")
            return []
        }
        try {
            await scrollToBottom(this.page);
        } catch (error) { 
            if (error instanceof TimeoutError) {
                console.log("Scanned All Reels")
            }
        };
        for (let i = 0; i < reelLen; i++) {
            let reel: ChannelReel = reels[i];
            reel.channel_reel_numerical_order = reelLen - i;
            reel.channel = { username: username }
        }
        return reels;
    }

}

async function scrollToBottom(page: Page) {
    let previousHeight = await page.evaluate('document.body.scrollHeight');
    while (true) {
        console.log("start scrolling");
        
        const numberOfScrolls = 20;
        const scrollAmount = -150;
        const delayBetweenScrolls = 0.1;

        for (let i = 0; i < numberOfScrolls; i++) {
            await page.evaluate((scrollY) => window.scrollBy(0, scrollY), scrollAmount);
            await sleep(delayBetweenScrolls)
        }
        const numberOfIncrements = 20;
        const scrollHeight = (await page.evaluate(() => document.body.scrollHeight)) + 500;
        const scrollIncrement = Math.floor(scrollHeight / numberOfIncrements);

        for (let i = 0; i < numberOfIncrements; i++) {
            await page.evaluate((scrollIncrement) => {
                window.scrollBy(0, scrollIncrement);
            }, scrollIncrement);
            await sleep(delayBetweenScrolls)
        }

        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 2000 });
        let currentHeight = await page.evaluate('document.body.scrollHeight');

        if (previousHeight >= currentHeight) {
            throw new TimeoutError('');
        }
        previousHeight = currentHeight;
        console.log("scrolling done");
        
    }
}
