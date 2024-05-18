import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Channel } from '../../entity/channel.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelFriendship } from '../../entity/channel-friendship.entity';
import { ChannelReel } from '../../entity/channel-reel.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { ChannelPost } from '../../entity/channel-post.entity';
import FindAllChannelDTO from '../dto/findall-channel.dto';
import ChannelPostDTO from '../dto/channel-post.dto';
import ChannelReelDTO from '../dto/channel-reel.dto';
import FindOneChannelDTO from '../dto/findone-channel.dto';
import ChannelCrawlService from './channel-crawl.service';
import ChannelMapperService from './channel-mapper.service';
import { ChannelExportService } from './channel-export.service';
import { ChannelDownloadService } from './channel-download.service';
import { GetChannelsQueryDTO } from '../dto/get-channels-query.dto';
import ChannelHelper from './channel-helper.service';
import { CrawlInfo, DownloadType, GetUserScrapeInfosDTO } from '../dto/get-user-scrape-info.dto';
import { GetExportTypeDTO } from '../dto/get-export-type.dto';
import { sleep } from 'src/pptr/utils/Utils';
import ChannelScraperService from './channel-scraper.service';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    @InjectDataSource('instagram-scraper') private readonly dataSource: DataSource,
    @InjectRepository(Channel, 'instagram-scraper') private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelFriendship, 'instagram-scraper') private readonly channelFriendRepository: Repository<ChannelFriendship>,
    @InjectRepository(ChannelReel, 'instagram-scraper') private readonly channelReelRepository: Repository<ChannelReel>,
    @InjectRepository(ChannelPost, 'instagram-scraper') private readonly channelPostRepository: Repository<ChannelPost>,
    @Inject(forwardRef(() => ChannelExportService)) private readonly exportService: ChannelExportService,
    @Inject(forwardRef(() => ChannelDownloadService)) private readonly downloadService: ChannelDownloadService,
    private readonly channelScraperService: ChannelScraperService,
    private readonly crawlService: ChannelCrawlService,
    private readonly mapperService: ChannelMapperService,
    private readonly channelHelper: ChannelHelper,
  ) {
  }

  async findOne(username: string): Promise<FindAllChannelDTO> {
    return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOne({ where: { username } }))
  }

  async findAll(queries?: GetChannelsQueryDTO): Promise<FindAllChannelDTO[]> {
    let channels: Channel[] = []
    if (!queries) {
      channels = await this.channelRepository.find()
      return this.mapperService.mapToFindAllChannelDTOs(channels);
    }
    return []
  }

  async fetchUsers(usernames: string[], options: {
    crawl?: {
      profile?: boolean,
      friendships?: boolean,
      posts?: boolean,
      reels?: boolean
    },
    export?: boolean,
    download?: boolean
  } = { crawl: { profile: true } }): Promise<FindOneChannelDTO[]> {
    const usernameLen = usernames.length;
    let channels: FindOneChannelDTO[] = []
    for (const [index, username] of usernames.entries()) {
      try {
        let channel = await this.fetchUser(username, false)
        channels.push(channel)
        this.logger.log(`Fetch user successfully (${index+1}/${usernameLen}): ${username} `)
        await sleep(3)
      } catch (error) {
        this.logger.warn(`Fetch user failed (${index+1}/${usernameLen}): ${username} `)
      }
    }
    return channels;
  }

  async fetchUser(username: string, log: boolean = true, options: GetUserScrapeInfosDTO = { crawl: { profile: true } }): Promise<FindOneChannelDTO> {
    const channel: FindOneChannelDTO = await this.handleCrawlOptions(username, options.crawl)
    this.handleExportOptions(username, options.export)
    this.handleDownloadOptions(username, options.download)
    if (log) this.logger.log(`Fetch User ${username} Successfully`)
    return channel;
  }

  private async handleCrawlOptions(username: string, crawl?: CrawlInfo): Promise<FindOneChannelDTO> {
    await this.fetchUserProfile(username);
    let friendships: FindAllChannelDTO[] = crawl.friendships
      ? await this.fetchFriendships(username)
      : undefined;
    let posts: ChannelPostDTO[] = crawl.posts
      ? await this.fetchPosts(username)
      : undefined
    let reels: ChannelReelDTO[] = crawl.reels
      ? await this.fetchReels(username)
      : undefined
    return {
      ...(await this.fetchUserProfile(username)), // call again to update the return channel crawling histories
      friendships,
      posts,
      reels
    }
  }

  private async handleExportOptions(username: string, exportOptions?: GetExportTypeDTO) {
    if (!exportOptions) return;
    this.exportService.exportChannel(username, exportOptions.type)
  }

  private async handleDownloadOptions(username: string, download?: DownloadType) {
    if (!download) return;

    if (download.posts) {
      const { all, from_order, to_order } = download.posts;
      await this.downloadService.download(username, { type: 'posts', all, from_order, to_order })
    }

    if (download.reels) {
      const { all, from_order, to_order } = download.posts;
      await this.downloadService.download(username, { type: 'reels', all, from_order, to_order })
    }
  }

  async fetchUserProfiles(usernames: string[]): Promise<FindAllChannelDTO[]> {
    let channels: Channel[] = await this.crawlService.crawlProfiles(usernames);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelRepository.save(channels);
      await Promise.all(channels.map(channel =>
        this.channelHelper.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])
      ));
    });

    // Optionally refetch channels if updates are expected to reflect in the return
    const updatedChannels = await Promise.all(
      channels.map(channel =>
        this.channelRepository.findOneBy({ username: channel.username })
      )
    );
    this.logger.log(`Fetch User Profiles ${usernames.join(", ")} Successfully`)
    return this.mapperService.mapToFindAllChannelDTOs(updatedChannels.filter(Boolean));
  }

  async fetchUserProfile(username: string): Promise<FindAllChannelDTO> {
    if (await this.channelHelper.isExists(username) && await this.channelHelper.isCrawledContent(username, "CHANNEL_PROFILE")) {
      return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOneBy({ username }))
    }

    let channel: Channel = await this.crawlService.crawlProfile(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelRepository.save(channel);
      await this.channelHelper.writeCrawlHistory(username, ["CHANNEL_PROFILE"])
    })

    this.logger.log(`Fetch User ${username} Profile Successfully`)
    return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOneBy({ username }));
  }

  async fetchFriendships(username: string): Promise<FindAllChannelDTO[]> {
    if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.channelHelper.isCrawledContent(username, "CHANNEL_FRIENDSHIP")) {
      return this.mapperService.mapToFindAllChannelDTOs(
        await this.mapperService.findAllChannelsByRootFriendshipUsername(username)
      )
    }

    try {
      let friendshipUsernames: string[] = await this.crawlService.crawlFriendships(username);
      const channels: Channel[] = await this.channelScraperService.scrapeProfiles(friendshipUsernames);

      const friendships: ChannelFriendship[] = channels.map(channel => ({
        username: username,
        channel_username: channel.username
      }));
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.channelRepository.save(channels);
        await Promise.all(channels.map(channel => this.channelHelper.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])));

        await this.channelFriendRepository.save(friendships)
        await this.channelHelper.writeCrawlHistory(username, ["CHANNEL_FRIENDSHIP"])
      })

      this.logger.log(`Fetch Friendships Of User: ${username} Successfully`)
      return this.mapperService.mapToFindAllChannelDTOs(
        await this.mapperService.findAllChannelsByRootFriendshipUsername(username)
      )
    } catch (error) {
      console.log(error);
      return []
    }
  }

  async fetchPosts(username: string): Promise<ChannelPostDTO[]> {
    if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.channelHelper.isCrawledContent(username, "CHANNEL_POSTS")) {
      return this.mapperService.mapToChannelPostDTOs(
        await this.channelPostRepository.findBy({ channel: { username } })
      )
    }

    let posts: ChannelPost[] = await this.crawlService.crawlPosts(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelPostRepository.save(posts)
      await this.channelHelper.writeCrawlHistory(username, ["CHANNEL_POSTS"])
    })

    this.logger.log(`Fetch Posts Of User: ${username} Successfully`)
    return this.mapperService.mapToChannelPostDTOs(posts);
  }

  async fetchReels(username: string): Promise<ChannelReelDTO[]> {
    if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.channelHelper.isCrawledContent(username, "CHANNEL_REELS")) {
      return this.mapperService.mapToChannelReelDTOs(await this.channelReelRepository.findBy({ channel: { username } }))
    }
    let reels: ChannelReel[] = await this.crawlService.crawlReels(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelReelRepository.save(reels)
      await this.channelHelper.writeCrawlHistory(username, ["CHANNEL_REELS"])
    })

    this.logger.log(`Fetch Reels Of User: ${username} Successfully`)
    return this.mapperService.mapToChannelReelDTOs(reels);
  }
}

