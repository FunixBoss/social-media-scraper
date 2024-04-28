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
import { GetChannelsParamsDto, ScrapeInfo } from './channel.controller';
import { Channel } from '../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelFriendship } from '../entity/channel-friendship.entity';
import { ChannelReel } from '../entity/channel-reel.entity';
import { CrawlingType, TCrawlingType } from '../entity/crawling-type.entity';
import { ChannelCrawlingHistory } from '../entity/channel-crawling-history.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { ChannelPost } from '../entity/channel-post.entity';
import { Workbook } from 'exceljs'
import { format } from 'date-fns';
import { createReadStream, createWriteStream, promises, ReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import FindAllChannelDTO from './dto/findall-channel.dto';
import axios from 'axios';
import ChannelPostDTO from './dto/channel-post.dto';
import ChannelFriendshipDTO from './dto/channel-friendship.dto';
import ChannelReelDTO from './dto/channel-reel.dto';
import FindOneChannelDTO from './dto/findone-channel.dto';

export type ReadStreamDTO = {
  readStream: ReadStream;
  fileName: string;
}
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
      await this.page.target().createCDPSession(),
      {
        onError: (error) => {
          console.error('Request interception error:', error)
        },
      }
    )
  }

  async mapToFindAllChannelDTO(channel: Channel): Promise<FindAllChannelDTO> {
    let crawled: string[] = channel.crawlingHistory.map(c => c.crawling_type_name)
    channel.crawlingHistory = undefined;
    return {
      ...channel,
      url: `${this.baseUrl}/${channel.username}`,
      crawled
    }
  }

  async mapToChannelPostDTOs(posts: ChannelPost[]): Promise<ChannelPostDTO[]> {
    return posts.map(post => {
      return {
        ...post,
        url: `${this.baseUrl}/p/${post.code}/`,
      }
    })
  }

  async mapToChannelReelDTOs(reels: ChannelReel[]): Promise<ChannelReelDTO[]> {
    return reels.map(reel => {
      return {
        ...reel,
        url: `${this.baseUrl}/reel/${reel.code}/`,
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
        channel_username: f.channel?.username
      }
    })
  }

  async mapToFindOneChannel(channel: Channel, friendships?: ChannelFriendship[], posts?: ChannelPost[], reels?: ChannelReel[]): Promise<FindOneChannelDTO> {
    return {
      ...(await this.mapToFindAllChannelDTO(channel)),
      friendships: friendships ? await this.mapToChannelFriendshipDTOs(friendships) : friendships,
      posts: posts ? await this.mapToChannelPostDTOs(posts) : posts,
      reels: reels ? await this.mapToChannelReelDTOs(reels) : reels
    }
  }

  async mapToFindAllChannelDTOs(channels: Channel[]): Promise<FindAllChannelDTO[]> {
    return channels.map(channel => {
      let crawled: string[] = channel.crawlingHistory.map(c => c.crawling_type_name)
      return {
        ...channel,
        url: `${this.baseUrl}/${channel.username}`,
        crawlingHistory: undefined,
        crawled
      }
    })
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

  private async isCrawledContent(username: string, crawledType: TCrawlingType): Promise<boolean> {
    return !!(await this.channelCrawlRepository.findOneBy({
      channel_username: username,
      crawling_type_name: crawledType
    }))
  }

  private async getCrawledHistory(username): Promise<TCrawlingType[]> {
    const histories: ChannelCrawlingHistory[] = await this.channelCrawlRepository.findBy({
      channel_username: username,
    })
    return histories.map(h => h.crawlingType.name) as TCrawlingType[]
  }

  private async isExists(username: string): Promise<boolean> {
    return !!await this.channelRepository.findOneBy({ username });
  }

  async exportChannels(exportType: string | "json" | "excel"): Promise<ReadStreamDTO> {
    if (exportType == 'excel') return await this.exportChannelsExcel();
    if (exportType == 'json') return await this.exportChannelsJson();
  }

  private async exportChannelsExcel(): Promise<ReadStreamDTO> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Channels');

    // Define headers
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Follower Count', key: 'follower_count', width: 15 },
      { header: 'Following Count', key: 'following_count', width: 15 },
      { header: 'Total Posts', key: 'total_posts', width: 12 },
      { header: 'Total Reels', key: 'total_reels', width: 12 },
      { header: 'Total Friendships', key: 'total_friendships', width: 17 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Biography', key: 'biography', width: 100 },
      { header: 'Bio Link URL', key: 'bio_link_url', width: 30 },
      { header: 'External URL', key: 'external_url', width: 30 },
      { header: 'Profile Pic URL', key: 'profile_pic_url', width: 30 },
      { header: 'Is Bot Scanning', key: 'is_bot_scanning', width: 15 },
    ];

    // Add rows using the mock data
    (await this.channelRepository.find()).forEach((channel) => {
      worksheet.addRow(channel);
    });

    // Write to file
    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channels'
    const fileName = `channels-${currentDate}.xlsx`
    await workbook.xlsx.writeFile(`${downloadPath}/${fileName}`);
    console.log('Excel file was written successfully.');
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }

  private async exportChannelsJson(): Promise<ReadStreamDTO> {
    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channels'
    const fileName = `channels-${currentDate}.json`
    writeFileSync(`${downloadPath}/${fileName}`, JSON.stringify(await this.channelRepository.find()), 'utf-8')
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }

  async downloadReels(username: string): Promise<any[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    let reels: ChannelReelDTO[] = [];
    if (await this.isCrawledContent(username, "CHANNEL_REELS")) {
      reels = await this.mapToChannelReelDTOs(await this.channelReelRepository.find({
        where: { channel: { username } }
      }))
    } else {
      reels = await this.fetchReels(username)
    }
    let reelsLen = reels.length;
    if (reelsLen == 0) return [];

    const DOWNLOAD_PATH = `downloads/instagram/channel/${username}`
    await createAndAccessFolder(DOWNLOAD_PATH);
    const downloadPromises = reels.map(reel => this.downloadVideo(reel, DOWNLOAD_PATH));
    return await Promise.all(downloadPromises);
  }

  async downloadVideo(reel: ChannelReelDTO, downloadPath: string): Promise<string> {
    const { video_url, channel_reel_numerical_order, code } = reel;
    const videoName = `${channel_reel_numerical_order}-${code}.mp4`;
    const filePath = `${downloadPath}/${videoName}`;
    console.log(`Downloading: ${videoName}`)
    try {
      const response = await axios(video_url, { method: 'GET', responseType: 'stream' });
      const writer = createWriteStream(filePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', (err) => {
          console.error(`Error writing file at ${filePath}:`, err);
          writer.close();
          reject(err);
        });
      });
    } catch (error) {
      console.error(`Error downloading video from ${video_url} to ${filePath}:`, error["name"]);
      throw error;
    }
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
    let friendshipLen: number = friendshipUsers.length;

    let posts: ChannelPost[] = scanned.includes("CHANNEL_POSTS")
      ? await this.channelPostRepository.find({ where: { channel: { username } } })
      : [];
    let postLen: number = posts.length;

    let reels: ChannelReel[] = scanned.includes("CHANNEL_REELS")
      ? await this.channelReelRepository.find({ where: { channel: { username } } })
      : [];
    let reelLen: number = reels.length;
    console.log(reelLen);

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
              friendshipLen = friendshipUsers.length;
              profile.total_friendships = friendshipLen;
              scanning.push('CHANNEL_FRIENDSHIP');
              console.log("Scanned All Friendships")
            } else if (!scanned.includes('CHANNEL_POSTS') && infos.includes('posts') && dataObj.data["xdt_api__v1__feed__user_timeline_graphql_connection"]) {
              console.log("==> Found Response: Posts");
              const pagedPosts: ChannelPost[] = await mapInsPosts(dataObj.data as InsPostsFull);
              posts.push(...pagedPosts);
              postLen += pagedPosts.length
              console.log(postLen);
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
              reelLen += pagedReels.length
              console.log(reelLen);
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
          profile.total_reels = reelLen
        }
      };
    } else if (!hasReels) {
      profile.total_reels = 0;
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
          await this.channelFriendRepository.save(friendshipUsers)
        }

        if (scanning.includes("CHANNEL_POSTS")) {
          channelCrawlings.push({
            channel_username: username,
            crawling_type_name: 'CHANNEL_POSTS',
            date: new Date()
          })
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
        channel.total_reels = 0;
      }
      if (channel.total_posts == 0) {
        channelCrawlings.push({
          channel_username: username,
          crawling_type_name: 'CHANNEL_POSTS',
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
      return this.channelFriendRepository.find({
        where: { channel: { username } }
      })
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
    return friendshipUsers;
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
    return posts;
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
    await page.evaluate('window.scrollBy(0, -1500)');
    await sleep(1)
    await page.evaluate('window.scrollBy(0, +document.body.scrollHeight)');
    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 2000 });
    let currentHeight = await page.evaluate('document.body.scrollHeight');

    if (previousHeight >= currentHeight) {
      throw new TimeoutError('');
    }
    previousHeight = currentHeight;
    await sleep(1);
  }
}

async function createAndAccessFolder(path: string): Promise<void> {
  try {
    await promises.mkdir(path, { recursive: true });
    console.log(`Directory created at ${path}`);
  } catch (error) {
    console.error(`Error creating directory at ${path}:`, error);
    throw error; // Rethrow to handle it in the calling function
  }
}