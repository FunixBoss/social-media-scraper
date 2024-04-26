import { Injectable } from '@nestjs/common';
import { InjectPage } from 'nestjs-puppeteer';
import { Page, TimeoutError } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsProfile, InsProfileFull, mapInsProfile } from 'src/pptr-crawler/types/ins/InsProfile';
import { InsAPIWrapper } from 'src/pptr-crawler/types/ins/InsAPIWrapper';
import { InsReel, InsReels, InsReelsFull, mapInsReels } from 'src/pptr-crawler/types/ins/InsReels';
import { sleep } from 'src/pptr-crawler/utils/Utils';
import { InsFriendshipUserFull, InsFriendshipUsers } from 'src/pptr-crawler/types/ins/InsFriendship';
import { InsHighlight, InsHighlights, InsHighlightsFull, mapInsHighlight } from 'src/pptr-crawler/types/ins/InsHighlights';
import { InsPost, InsPosts, InsPostsFull, mapInsPosts } from 'src/pptr-crawler/types/ins/InsPosts';
import { ScrapeInfo } from './channel.controller';
import InsUser from 'src/pptr-crawler/types/ins/InsUser';
import { info } from 'console';

@Injectable()
export class ChannelService {
  private baseUrl = 'https://instagram.com'
  private interceptManager: RequestInterceptionManager
  constructor(
    @InjectPage('instagram', 'social-media-scraper') private readonly page: Page
  ) {
    this.setUpPageInterceptors()

  }

  async setUpPageInterceptors(): Promise<void> {
    let i = 0;
    this.interceptManager = new RequestInterceptionManager(
      await this.page.target().createCDPSession(),
      {
        onError: (error) => {
          console.error('Request interception error:', error)
        },
      }
    )
  }

  async fetchUser(username: string, infos: ScrapeInfo[]): Promise<InsUser> {
    let profile: InsProfile;
    let friendshipUsers: InsFriendshipUsers = { users: [], len: 0 };
    let highlights: InsHighlights = { highlights: [], len: 0 };
    let posts: InsPosts = { posts: [], len: 0 };
    let reels: InsReels = { reels: [], len: 0 };
    let scanned: ScrapeInfo[] = []
    await this.interceptManager.intercept(
      {
        urlPattern: `https://www.instagram.com/api/graphql`,
        resourceType: 'XHR',
        modifyResponse: async ({ body }) => {
          try {
            const dataObj: InsAPIWrapper = JSON.parse(body);
            if (!dataObj.data) return;

            if (!scanned.includes('profile') && infos.includes('profile') && dataObj.data["user"]) {
              console.log("==> Found Response: User Profile");
              profile = mapInsProfile(dataObj.data as InsProfileFull)
              scanned.push('profile')
            } else if (!scanned.includes('friendships') && infos.includes('friendships') && dataObj.data["xdt_api__v1__discover__chaining"]) {
              console.log("==> Found Response: Friendship Users");
              const friendshipUserApis = dataObj.data as InsFriendshipUserFull
              friendshipUsers = {
                users: friendshipUserApis.xdt_api__v1__discover__chaining.users,
                len: friendshipUserApis.xdt_api__v1__discover__chaining.users.length
              }
              scanned.push('friendships');
            } else if (infos.includes('posts') && dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
              console.log("==> Found Response: Posts");
              const pagedPosts: InsPost[] = await mapInsPosts(dataObj.data as InsPostsFull);
              posts.posts.push(...pagedPosts);
              posts.len += pagedPosts.length
              console.log(posts.len);
            }
          } catch (error) {
            console.log(error);
          }
        },
      },
      {
        urlPattern: `https://www.instagram.com/graphql/query`,
        resourceType: 'XHR',
        modifyResponse: async ({ body }) => {
          try {
            const dataObj: InsAPIWrapper = JSON.parse(body);
            if (!scanned.includes('highlights') && infos.includes('highlights') && dataObj.data && dataObj.data["highlights"]) {
              console.log("==> Found Graphql Request: Highlights");
              let pagedHighlights: InsHighlight[] = mapInsHighlight(dataObj.data as InsHighlightsFull)
              highlights.highlights.push(...pagedHighlights)
              highlights.len += pagedHighlights.length
              scanned.push('highlights')
            } else if (infos.includes('reels') && dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
              console.log("==> Found Graphql Request: Reels");
              const pagedReels: InsReel[] = mapInsReels(dataObj.data as InsReelsFull)
              reels.reels.push(...pagedReels)
              reels.len += pagedReels.length
              console.log(reels.len);
            }
          } catch (error) {
            console.log(error);
          }
        },
      }
    )

    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    if (infos.includes('posts')) {
      try {
        await scrollToBottom(this.page);
        scanned.push('posts')
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.log("Scanned All Posts")
        }
      };
    }
    await sleep(2)
    if(infos.includes('reels')) {
      await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'networkidle2' })
      try {
        await scrollToBottom(this.page);
        scanned.push('reels')
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.log("Scanned All Posts")
        }
      };
    }

    return {
      profile,
      friendshipUsers,
      highlights,
      posts,
      reels
    }
  }

  async fetchUserProfile(username: string): Promise<InsProfile> {
    let profile: InsProfile;
    await this.interceptManager.intercept(
      {
        urlPattern: `https://www.instagram.com/api/graphql`,
        resourceType: 'XHR',
        modifyResponse: async ({ body }) => {
          try {
            const dataObj: InsAPIWrapper = JSON.parse(body);
            if (!dataObj.data) return;

            if (dataObj.data["user"]) {
              console.log("==> Found Response: User Profile");
              profile = mapInsProfile(dataObj.data as InsProfileFull)
            }
          } catch (error) {
            console.log(error)
          }
        }
      })
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    return profile;
  }

  async fetchFriendships(username: string): Promise<InsFriendshipUsers> {
    let friendshipUsers: InsFriendshipUsers = { users: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (!dataObj.data) return;

          if (dataObj.data["xdt_api__v1__discover__chaining"]) {
            console.log("==> Found Response: Friendship Users");
            const friendshipUserApis = dataObj.data as InsFriendshipUserFull
            friendshipUsers = {
              users: friendshipUserApis.xdt_api__v1__discover__chaining.users,
              len: friendshipUserApis.xdt_api__v1__discover__chaining.users.length
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    return friendshipUsers;
  }

  async fetchHighlights(username: string): Promise<InsHighlights> {
    let highlights: InsHighlights = { highlights: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/graphql/query`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data && dataObj.data["highlights"]) {
            console.log("==> Found Graphql Request: Highlights");
            let pagedHighlights: InsHighlight[] = mapInsHighlight(dataObj.data as InsHighlightsFull)
            highlights.highlights.push(...pagedHighlights)
            highlights.len += pagedHighlights.length
          }
        } catch (error) {
          console.log(error);
        }
      },
    })
    await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'networkidle2' })
    return highlights;
  }

  async fetchPosts(username: string): Promise<InsPosts> {
    let posts: InsPosts = { posts: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
            console.log("==> Found Response: Posts");
            const pagedPosts: InsPost[] = await mapInsPosts(dataObj.data as InsPostsFull);
            posts.posts.push(...pagedPosts);
            posts.len += pagedPosts.length
            console.log(posts.len);
          }
        } catch (error) {
          console.log(error);
        }
      }
    })
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    try {
      await scrollToBottom(this.page);
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.log("Scanned All Posts")
      }
    };
    await sleep(2);
    return posts;
  }

  async fetchReels(username: string): Promise<InsReels> {
    let reels: InsReels = { reels: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/graphql/query`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj && dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
            console.log("==> Found Graphql Request: Reels");
            const pagedReels: InsReel[] = mapInsReels(dataObj.data as InsReelsFull)
            reels.reels.push(...pagedReels)
            reels.len += pagedReels.length
            console.log(reels.len);
          }
        } catch (error) {
          console.log(error);
        }
      },
    })
    await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'networkidle2' })
    try {
      await scrollToBottom(this.page);
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.log("Scanned All Posts")
      }
    };
    await sleep(2);
    return reels;
  }

}

async function scrollToBottom(page: Page) {
  let previousHeight = await page.evaluate('document.body.scrollHeight');
  while (true) {
    console.log("run")
    await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');
    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 2000 });
    let currentHeight = await page.evaluate('document.body.scrollHeight');

    if (previousHeight >= currentHeight) {
      break;
    }
    previousHeight = currentHeight;
    await sleep(1);
  }
  console.log("out")
}
