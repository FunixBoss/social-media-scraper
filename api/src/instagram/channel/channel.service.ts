import { Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InjectPage } from 'nestjs-puppeteer';
import { Page } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsProfile, InsProfileFull, mapInsProfile } from 'src/pptr-crawler/types/ins/InsProfile';
import { InsAPIWrapper } from 'src/pptr-crawler/types/ins/InsAPIWrapper';
import { InsReel, InsReels, InsReelsFull, mapInsReels } from 'src/pptr-crawler/types/ins/InsReels';
import { sleep } from 'src/pptr-crawler/utils/Utils';
import { InsPageInfo } from 'src/pptr-crawler/types/ins/InsPageInfo';

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
    // await interceptManager.intercept(
    //   {
    //     urlPattern: `https://www.instagram.com/api/graphql`,
    //     resourceType: 'XHR',
    //     modifyResponse: async ({ body }) => {
    //       try {
    //         const dataObj: InsAPIWrapper = JSON.parse(body);
    //         if (!dataObj.data) return;

    //         if (dataObj.data["user"]) {
    //           console.log("==> Found Response: User Profile");
    //           const profile: InsProfile = mapInsProfile(dataObj.data as InsProfileFull)
    //           writeFile(`./src/store/profiles/${profile.username}.json`, JSON.stringify(profile), 'utf-8')
    //         } else if (dataObj.data["xdt_api__v1__discover__chaining"]) {
    //           console.log("==> Found Response: Friendship Users");
    //           const friendshipUsers = dataObj.data as InsFriendshipUsers
    //           const len: number = friendshipUsers.xdt_api__v1__discover__chaining.users.length
    //           for (let i = 0; i < len; i++) {
    //             const user: InsFriendshipUser = friendshipUsers.xdt_api__v1__discover__chaining.users[i];
    //             writeFile(`./src/store/friendship-users/${i}-${user.username}.json`, JSON.stringify(user), 'utf-8')
    //           }
    //         } else if (dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
    //           console.log("==> Found Response: Posts");
    //           const posts: InsPosts = mapInsPosts(dataObj.data as InsPostsFull);
    //           const len: number = posts.posts.length
    //           for (let i = 0; i < len; i++) {
    //             const post: InsPost = posts.posts[i];
    //             writeFile(`./src/store/posts/${i}-${post.code}.json`, JSON.stringify(post), 'utf-8')
    //           }
    //         }
    //       } catch (error) {
    //         console.log(error);
    //       }
    //     },
    //   },
    //   {
    //     urlPattern: `https://www.instagram.com/graphql/query`,
    //     resourceType: 'XHR',
    //     modifyResponse: async ({ body }) => {
    //       try {
    //         const dataObj: InsAPIWrapper = JSON.parse(body);
    //         if (dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
    //           console.log("==> Found Graphql Request: Reels");
    //           const reels: InsReels = mapInsReels(dataObj.data as InsReelsFull)
    //           const reelsLen: number = reels.reels.length
    //           for (let i = 0; i < reelsLen; i++) {
    //             const reel: InsReel = reels.reels[i];
    //             writeFile(`./src/store/reels/${i}-${reel.code}.json`, JSON.stringify(reel), 'utf-8')
    //           }
    //         }
    //       } catch (error) {
    //         console.log(error);
    //       }
    //     },
    //   }
    // )
  }

  async fetchUserProfile(username): Promise<InsProfile> {
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
    await this.page.goto(`${this.baseUrl}/${username}`)
    return profile;
  }

  async fetchReels(username): Promise<InsReels> {
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
    await scrollToBottom(this.page);
    await sleep(2)
    return reels
  }

  create(createChannelDto: CreateChannelDto) {
    return 'This action adds a new channel';
  }

  findAll() {
    return `This action returns all channel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} channel`;
  }

  update(id: number, updateChannelDto: UpdateChannelDto) {
    return `This action updates a #${id} channel`;
  }

  remove(id: number) {
    return `This action removes a #${id} channel`;
  }
}

async function scrollToBottom(page) {
  let previousHeight = await page.evaluate('document.body.scrollHeight');

  while (true) {
    console.log("run")
    await page.evaluate('window.scrollBy(0, document.body.scrollHeight)');
    await page.waitForFunction(
      `document.body.scrollHeight >= ${previousHeight}`
    );
    let currentHeight = await page.evaluate('document.body.scrollHeight');

    if (previousHeight >= currentHeight) {
      break;
    }
    previousHeight = currentHeight;
    await sleep(1);
  }

  console.log("out")
}
