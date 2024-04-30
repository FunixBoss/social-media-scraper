import { Injectable } from '@nestjs/common';
import { InjectPage } from 'nestjs-puppeteer';
import { Page, TimeoutError } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsProfileFull, mapInsProfile } from 'src/pptr-crawler/types/ins/InsProfile';
import { InsAPIWrapper } from 'src/pptr-crawler/types/ins/InsAPIWrapper';
import { InsReelsFull, mapInsReels } from 'src/pptr-crawler/types/ins/InsReels';
import { sleep } from 'src/pptr-crawler/utils/Utils';
import { InsFriendshipUserFull } from 'src/pptr-crawler/types/ins/InsFriendship';
import { InsPostsFull, mapInsPosts } from 'src/pptr-crawler/types/ins/InsPosts';
import { GetChannelsParamsDto, ScrapeInfo } from '../channel.controller';
import { Channel } from '../../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelFriendship } from '../../entity/channel-friendship.entity';
import { ChannelReel } from '../../entity/channel-reel.entity';
import { CrawlingType, TCrawlingType } from '../../entity/crawling-type.entity';
import { ChannelCrawlingHistory } from '../../entity/channel-crawling-history.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { ChannelPost } from '../../entity/channel-post.entity';
import FindAllChannelDTO from '../dto/findall-channel.dto';
import ChannelPostDTO from '../dto/channel-post.dto';
import ChannelFriendshipDTO from '../dto/channel-friendship.dto';
import ChannelReelDTO from '../dto/channel-reel.dto';
import FindOneChannelDTO from '../dto/findone-channel.dto';

@Injectable()
export class ChannelService {
  private baseUrl = 'https://instagram.com'
  private interceptManager: RequestInterceptionManager
  constructor(
    private readonly dataSource: DataSource,
    @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelFriendship) private readonly channelFriendRepository: Repository<ChannelFriendship>,
    @InjectRepository(ChannelReel) private readonly channelReelRepository: Repository<ChannelReel>,
    @InjectRepository(CrawlingType) private readonly crawlingTypeRepository: Repository<CrawlingType>,
    @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlRepository: Repository<ChannelCrawlingHistory>,
    @InjectRepository(ChannelPost) private readonly channelPostRepository: Repository<ChannelPost>,
    @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlingHistoryRepository: Repository<ChannelCrawlingHistory>,
  ) {
    this.setUpPageInterceptors()
  }

  async setUpPageInterceptors(): Promise<void> {
    this.interceptManager = new RequestInterceptionManager(
      await this.page.target().createCDPSession() as any,
      {
        onError: (error) => {
          console.error('Request interception error:', error)
        },
      }
    )
  }

  async findOne(username: string): Promise<FindAllChannelDTO> {
    return this.mapToFindAllChannelDTO(await this.channelRepository.findOne({ where: { username } }))
  }

  async mapToFindAllChannelDTO(channel: Channel): Promise<FindAllChannelDTO> {
    let crawled: string[] = channel.crawlingHistory.map(c => c.crawling_type_name)
    return {
      ...channel,
      total_posts: crawled.includes("CHANNEL_POSTS") ? await this.getTotalPost(channel.username) : undefined,
      total_reels: crawled.includes("CHANNEL_REELS") ? await this.getTotalReel(channel.username) : undefined,
      total_friendships: crawled.includes("CHANNEL_FRIENDSHIP") ? await this.getTotalFriendship(channel.username) : undefined,
      url: `${this.baseUrl}/${channel.username}`,
      crawlingHistory: undefined,
      crawled
    } as FindAllChannelDTO
  }

  async mapToFindAllChannelDTOs(channels: Channel[]): Promise<FindAllChannelDTO[]> {
    const promises = channels.map(channel => this.mapToFindAllChannelDTO(channel));
    return Promise.all(promises);
  }


  async mapToChannelPostDTOs(posts: ChannelPost[]): Promise<ChannelPostDTO[]> {
    return posts.map(post => {
      const { code, caption_text, like_count, channel_post_numerical_order, carousel_media_count, video_url, video_type, comment_count, product_type } = post
      const image_urls: string[] = post.images.map(img => img.image_url)
      return {
        code,
        url: `${this.baseUrl}/p/${post.code}/`,
        caption_text,
        channel_post_numerical_order,
        carousel_media_count,
        image_urls,
        video_url,
        video_type,
        like_count,
        comment_count,
        product_type
      }
    })
  }

  async mapToChannelReelDTOs(reels: ChannelReel[]): Promise<ChannelReelDTO[]> {
    return reels.map(reel => {
      const { code, channel_reel_numerical_order, comment_count, image_url, like_count, media_type, play_count, product_type, video_url } = reel
      return {
        code,
        url: `${this.baseUrl}/reel/${reel.code}/`,
        channel_reel_numerical_order,
        comment_count,
        image_url,
        like_count,
        media_type,
        play_count,
        product_type,
        video_url,
        channel_username: reel.channel?.username
      }
    })
  }

  async mapToChannelFriendshipDTOs(friends: ChannelFriendship[]): Promise<ChannelFriendshipDTO[]> {
    return friends.map(f => {
      const { profile_pic_url, full_name, username } = f
      return {
        profile_pic_url,
        username,
        full_name,
        url: `${this.baseUrl}/${username}`,
        channel_username: f.channel ? f.channel.username : undefined
      }
    })
  }

  async mapToFindOneChannelDTOfromOrigin(channel: FindAllChannelDTO, friendships?: ChannelFriendshipDTO[], posts?: ChannelPostDTO[], reels?: ChannelReelDTO[]): Promise<FindOneChannelDTO> {
    return {
      ...channel,
      friendships,
      posts,
      reels
    }
  }

  async mapToFindOneChannel(channel: Channel, friendships?: ChannelFriendship[], posts?: ChannelPost[], reels?: ChannelReel[]): Promise<FindOneChannelDTO> {
    return {
      ...(await this.mapToFindAllChannelDTO(channel)),
      friendships: friendships ? await this.mapToChannelFriendshipDTOs(friendships) : undefined,
      posts: posts ? await this.mapToChannelPostDTOs(posts) : undefined,
      reels: reels ? await this.mapToChannelReelDTOs(reels) : undefined
    }
  }



  private async getTotalPost(username: string): Promise<number> {
    return this.channelPostRepository.count({ where: { channel: { username } } })
  }

  private async getTotalReel(username: string): Promise<number> {
    return this.channelReelRepository.count({ where: { channel: { username } } })
  }

  private async getTotalFriendship(username: string): Promise<number> {
    return this.channelFriendRepository.count({ where: { channel: { username } } })
  }

  async findAll(queries: GetChannelsParamsDto): Promise<FindAllChannelDTO[]> {
    let channels: Channel[] = await this.channelRepository.find()
    return this.mapToFindAllChannelDTOs(channels);
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

  async isCrawledContent(username: string, crawledType: TCrawlingType): Promise<boolean> {
    return !!(await this.channelCrawlRepository.findOneBy({
      channel_username: username,
      crawling_type_name: crawledType
    }))
  }

  async getCrawledHistory(username): Promise<TCrawlingType[]> {
    const histories: ChannelCrawlingHistory[] = await this.channelCrawlRepository.findBy({
      channel_username: username,
    })
    return histories.map(h => h.crawlingType.name) as TCrawlingType[]
  }

  async isExists(username: string): Promise<boolean> {
    return !!await this.channelRepository.findOneBy({ username });
  }

  async fetchUser(username: string, infos: ScrapeInfo[]): Promise<FindOneChannelDTO> {
    let scanned: TCrawlingType[] = (await this.getCrawledHistory(username)).sort()
    let hasScannedAll: boolean = JSON.stringify(scanned) === JSON.stringify(["CHANNEL_FRIENDSHIP", "CHANNEL_POSTS", "CHANNEL_PROFILE", "CHANNEL_REELS"])
    let scanning: TCrawlingType[] = [];
    let profile: Channel = scanned.includes("CHANNEL_PROFILE")
      ? await this.channelRepository.findOne({ where: { username } })
      : undefined;
    let friendshipUsers: ChannelFriendship[] = scanned.includes("CHANNEL_FRIENDSHIP")
      ? await this.channelFriendRepository.find({ where: { channel: { username } } })
      : [];
    let posts: ChannelPost[] = scanned.includes("CHANNEL_POSTS")
      ? await this.channelPostRepository.find({ where: { channel: { username } } })
      : [];
    let reels: ChannelReel[] = scanned.includes("CHANNEL_REELS")
      ? await this.channelReelRepository.find({ where: { channel: { username } } })
      : [];

    if (hasScannedAll) return await this.mapToFindOneChannel(profile, friendshipUsers, posts, reels);

    await this.interceptManager.intercept(
      {
        urlPattern: `https://www.instagram.com/api/graphql`,
        resourceType: 'XHR',
        modifyResponse: async ({ body }) => {
          try {
            const dataObj: InsAPIWrapper = JSON.parse(body);
            if (!dataObj.data) return;

            if (!scanned.includes('CHANNEL_PROFILE') && infos.includes('profile') && dataObj.data["user"]) {
              console.log("==> Found Response: User Profile");
              profile = mapInsProfile(dataObj.data as InsProfileFull)
              profile.is_bot_scanning = false;
              profile.is_self_adding = true;
              scanning.push('CHANNEL_PROFILE')
            } else if (!scanned.includes('CHANNEL_FRIENDSHIP') && infos.includes('friendships') && dataObj.data["xdt_api__v1__discover__chaining"]) {
              console.log("==> Found Response: Friendship Users");
              const friendshipUserApis = dataObj.data as InsFriendshipUserFull
              friendshipUsers = friendshipUserApis.xdt_api__v1__discover__chaining.users;
              scanning.push('CHANNEL_FRIENDSHIP');
              console.log("Scanned All Friendships")
            } else if (!scanned.includes('CHANNEL_POSTS') && infos.includes('posts') && dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
              console.log("==> Found Response: Posts");
              const pagedPosts: ChannelPost[] = await mapInsPosts(dataObj.data as InsPostsFull);
              posts.push(...pagedPosts);
              console.log(`Scanned ${posts.length} Posts`);
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
            if (!scanned.includes('CHANNEL_REELS') && infos.includes('reels') && dataObj.data && dataObj.data["xdt_api__v1__clips__user__connection_v2"]) {
              console.log("==> Found Graphql Request: Reels");
              const pagedReels: ChannelReel[] = mapInsReels(dataObj.data as InsReelsFull)
              reels.push(...pagedReels)
              console.log(`Scanned ${reels.length} Reels`);
            }
          } catch (error) {
            console.log(error);
          }
        },
      }
    )

    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    let hasReels: boolean = await this.hasReelsTab();
    console.log(`hasReel: ${hasReels}`);

    if (!scanned.includes('CHANNEL_POSTS') && infos.includes('posts')) {
      try {
        await scrollToBottom(this.page);
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.log("Scanned All Posts")
          scanning.push('CHANNEL_POSTS');
        }
      };
    }
    if (hasReels && !scanned.includes('CHANNEL_REELS') && infos.includes('reels')) {
      await this.page.goto(`${this.baseUrl}/${username}/reels`, { waitUntil: 'networkidle2' })
      try {
        await scrollToBottom(this.page);
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.log("Scanned All Reels")
          scanning.push('CHANNEL_REELS');
        }
      };
    }
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const channelCrawlings: ChannelCrawlingHistory[] = [];
        if (scanning.includes("CHANNEL_PROFILE")) {
          channelCrawlings.push({
            channel_username: username,
            crawling_type_name: 'CHANNEL_PROFILE',
            date: new Date()
          })
          await this.channelRepository.save(profile)
        }
        profile = await this.channelRepository.findOne({ where: { username } })
        if (scanning.includes("CHANNEL_FRIENDSHIP")) {
          channelCrawlings.push({
            channel_username: username,
            crawling_type_name: 'CHANNEL_FRIENDSHIP',
            date: new Date()
          })
          friendshipUsers.forEach(f => f.channel = { username: username })
          await this.channelFriendRepository.save(friendshipUsers)
        }

        if (scanning.includes("CHANNEL_POSTS")) {
          channelCrawlings.push({
            channel_username: username,
            crawling_type_name: 'CHANNEL_POSTS',
            date: new Date()
          })
          const postLen = posts.length
          for (let i = postLen; i > 0; i--) {
            let post: ChannelPost = posts[i - 1];
            post.channel_post_numerical_order = i;
            post.channel = { username: username }
          }
          await this.channelPostRepository.save(posts)
        }

        if (!hasReels || scanning.includes("CHANNEL_REELS")) {
          channelCrawlings.push({
            channel_username: username,
            crawling_type_name: 'CHANNEL_REELS',
            date: new Date()
          })
          const reelLen = reels.length
          for (let i = reelLen; i > 0; i--) {
            let reel: ChannelReel = reels[i - 1];
            reel.channel_reel_numerical_order = i;
            reel.channel = { username: username }
          }
          await this.channelReelRepository.save(reels)
        }
        await this.channelCrawlingHistoryRepository.save(channelCrawlings);
      })
      profile = await this.channelRepository.findOne({ where: { username } })

    } catch (error) {
      console.log(error);
    }

    return await this.mapToFindOneChannel(profile, friendshipUsers, posts, reels)
  }

  async fetchUserProfile(username: string): Promise<FindAllChannelDTO> {
    if (await this.isExists(username) && await this.isCrawledContent(username, "CHANNEL_PROFILE")) {
      return this.mapToFindAllChannelDTO(await this.channelRepository.findOne({ where: { username } }))
    }

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
              console.log("==> Found Response: User Profile");
              channel = mapInsProfile(dataObj.data as InsProfileFull)
            }
          } catch (error) {
            console.log(error)
          }
        }
      })
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      let channelCrawlings: ChannelCrawlingHistory[] = []
      if (!await this.hasReelsTab()) {
        channelCrawlings.push({
          channel_username: username,
          crawling_type_name: 'CHANNEL_REELS',
          date: new Date()
        })
      }

      channelCrawlings.push({
        channel_username: username,
        crawling_type_name: 'CHANNEL_PROFILE',
        date: new Date()
      })
      await this.channelRepository.save(channel)
      await this.channelCrawlingHistoryRepository.save(channelCrawlings);
      channel = await this.channelRepository.findOne({ where: { username } })
    })
    return this.mapToFindAllChannelDTO(channel);
  }

  async fetchFriendships(username: string): Promise<ChannelFriendshipDTO[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_FRIENDSHIP")) {
      return await this.mapToChannelFriendshipDTOs(await this.channelFriendRepository.find({
        where: { channel: { username } }
      }))
    }

    let friendshipUsers: ChannelFriendship[] = [];
    let friendshipLen: number = 0;
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
            friendshipUsers = friendshipUserApis.xdt_api__v1__discover__chaining.users;
            friendshipUsers.forEach(f => f.channel = { username })
            friendshipLen += friendshipUsers.length
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const channelCrawling: ChannelCrawlingHistory = {
        channel_username: username,
        crawling_type_name: 'CHANNEL_FRIENDSHIP',
        date: new Date()
      }
      await this.channelRepository.save({ username, total_friendships: friendshipLen })
      await this.channelFriendRepository.save(friendshipUsers)
      await this.channelCrawlingHistoryRepository.save(channelCrawling);
    })
    return this.mapToChannelFriendshipDTOs(friendshipUsers);
  }

  async fetchPosts(username: string): Promise<ChannelPostDTO[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_POSTS")) {
      return this.mapToChannelPostDTOs(
        await this.channelPostRepository.find({ where: { channel: { username } } })
      )
    }

    let posts: ChannelPost[] = [];
    let len: number = 0
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
            console.log("==> Found Response: Posts");
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
    await this.page.goto(`${this.baseUrl}/${username}`, { waitUntil: 'networkidle2' })
    try {
      await scrollToBottom(this.page);
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.log("Scanned All Posts")
      }
    };
    for (let i = len; i > 0; i--) {
      let post: ChannelPost = posts[i - 1];
      post.channel_post_numerical_order = i;
      post.channel = { username: username }
    }
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const channelCrawling: ChannelCrawlingHistory = {
        channel_username: username,
        crawling_type_name: 'CHANNEL_POSTS',
        date: new Date()
      }
      await this.channelCrawlingHistoryRepository.save(channelCrawling);
      await this.channelPostRepository.save(posts)
    })
    await sleep(1);
    return this.mapToChannelPostDTOs(posts);
  }

  async fetchReels(username: string): Promise<ChannelReelDTO[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_REELS")) {
      return this.mapToChannelReelDTOs(await this.channelReelRepository.find({ where: { channel: { username } } }))
    }
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
    try {
      if (!await this.hasReelsTab()) {
        const channelCrawling: ChannelCrawlingHistory = {
          channel_username: username,
          crawling_type_name: 'CHANNEL_REELS',
          date: new Date()
        }
        await this.channelCrawlingHistoryRepository.save(channelCrawling);
        return []
      }
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
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      const channelCrawling: ChannelCrawlingHistory = {
        channel_username: username,
        crawling_type_name: 'CHANNEL_REELS',
        date: new Date()
      }
      await this.channelRepository.save({ username, total_reels: reelLen })
      await this.channelCrawlingHistoryRepository.save(channelCrawling);
      await this.channelReelRepository.save(reels)
    })
    return reels;
  }

}

async function scrollToBottom(page: Page) {
  let previousHeight = await page.evaluate('document.body.scrollHeight');
  while (true) {
    const numberOfScrolls = 20;
    const scrollAmount = -150;
    const delayBetweenScrolls = 0.07;

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
  }
}
