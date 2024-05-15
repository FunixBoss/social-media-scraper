import { Injectable, Logger } from '@nestjs/common';
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
import ChannelReelDTO from '../dto/channel-reel.dto';
import FindOneChannelDTO from '../dto/findone-channel.dto';
import ChannelCrawlService from './channel-crawl.service';
import ChannelMapperService from './channel-mapper.service';

@Injectable()
export class ChannelService {
  private readonly baseUrl = 'https://instagram.com'
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(ChannelFriendship) private readonly channelFriendRepository: Repository<ChannelFriendship>,
    @InjectRepository(ChannelReel) private readonly channelReelRepository: Repository<ChannelReel>,
    @InjectRepository(CrawlingType) private readonly crawlingTypeRepository: Repository<CrawlingType>,
    @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlRepository: Repository<ChannelCrawlingHistory>,
    @InjectRepository(ChannelPost) private readonly channelPostRepository: Repository<ChannelPost>,
    @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlingHistoryRepository: Repository<ChannelCrawlingHistory>,
    private readonly crawlService: ChannelCrawlService,
    private readonly mapperService: ChannelMapperService
  ) {
  }

  async findOne(username: string): Promise<FindAllChannelDTO> {
    return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOne({ where: { username } }))
  }

  async findAll(queries: GetChannelsParamsDto): Promise<FindAllChannelDTO[]> {
    let channels: Channel[] = await this.channelRepository.find()
    return this.mapperService.mapToFindAllChannelDTOs(channels);
  }

  async isCrawledContent(username: string, crawledType: TCrawlingType): Promise<boolean> {
    return await this.channelCrawlRepository.existsBy({
      channel_username: username,
      crawling_type_name: crawledType
    })
  }

  async getCrawledHistory(username: string): Promise<TCrawlingType[]> {
    const histories: ChannelCrawlingHistory[] = await this.channelCrawlRepository.findBy({
      channel_username: username,
    })
    return histories.map(h => h.crawlingType.name) as TCrawlingType[]
  }

  async isExists(username: string): Promise<boolean> {
    return await this.channelRepository.existsBy({ username });
  }

  async writeCrawlHistory(username: string, crawlingTypes: TCrawlingType[], isAll: boolean = false): Promise<void> {
    const date = new Date()
    if (isAll) {
      crawlingTypes = ["CHANNEL_PROFILE", 'CHANNEL_FRIENDSHIP', 'CHANNEL_POSTS', 'CHANNEL_REELS']
    }
    const crawlingHistories: ChannelCrawlingHistory[] = crawlingTypes.map(crawlType => {
      return {
        channel_username: username,
        crawling_type_name: crawlType,
        date
      }
    })
    await this.channelCrawlingHistoryRepository.save(crawlingHistories);


  }

  async fetchUser(username: string, needToScan: ScrapeInfo[]): Promise<FindOneChannelDTO> {
    await this.fetchUserProfile(username);
    let friendships: FindAllChannelDTO[] = needToScan.includes("friendships")
      ? await this.fetchFriendships(username)
      : undefined;
    let posts: ChannelPostDTO[] = needToScan.includes("posts")
      ? await this.fetchPosts(username)
      : undefined
    let reels: ChannelReelDTO[] = needToScan.includes("reels")
      ? await this.fetchReels(username)
      : undefined
    this.logger.log(`Fetch User ${username} - ${needToScan.join(", ")} Successfully`)
    return {
      ...(await this.fetchUserProfile(username)), // call again to update the return channel crawling histories
      friendships,
      posts,
      reels
    }
  }

  async fetchUserProfiles(usernames: string[]): Promise<FindAllChannelDTO[]> {
    let channels: Channel[] = await this.crawlService.crawlProfiles(usernames);

    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelRepository.save(channels);
      await Promise.all(channels.map(channel =>
        this.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])
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
    if (await this.isExists(username) && await this.isCrawledContent(username, "CHANNEL_PROFILE")) {
      return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOneBy({ username }))
    }

    let channel: Channel = await this.crawlService.crawlProfile(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelRepository.save(channel);
      await this.writeCrawlHistory(username, ["CHANNEL_PROFILE"])
    })

    this.logger.log(`Fetch User ${username} Profile Successfully`)
    return this.mapperService.mapToFindAllChannelDTO(await this.channelRepository.findOneBy({ username }));
  }

  async fetchFriendships(username: string): Promise<FindAllChannelDTO[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_FRIENDSHIP")) {
      return this.mapperService.mapToFindAllChannelDTOs(
        await this.mapperService.findAllChannelsByRootFriendshipUsername(username)
      )
    }

    try {
      let friendshipUsernames: string[] = await this.crawlService.crawlFriendships(username);
      let channels: Channel[] = await this.crawlService.crawlProfiles(friendshipUsernames);
      
      const friendships: ChannelFriendship[] = channels.map(channel => ({
        username: username,
        channel_username: channel.username
      }));
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.channelRepository.save(channels);
        await Promise.all(channels.map(channel => this.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])));

        await this.channelFriendRepository.save(friendships)
        await this.writeCrawlHistory(username, ["CHANNEL_FRIENDSHIP"])
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
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_POSTS")) {
      return this.mapperService.mapToChannelPostDTOs(
        await this.channelPostRepository.findBy({ channel: { username } })
      )
    }

    let posts: ChannelPost[] = await this.crawlService.crawlPosts(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelPostRepository.save(posts)
      await this.writeCrawlHistory(username, ["CHANNEL_POSTS"])
    })

    this.logger.log(`Fetch Posts Of User: ${username} Successfully`)
    return this.mapperService.mapToChannelPostDTOs(posts);
  }

  async fetchReels(username: string): Promise<ChannelReelDTO[]> {
    if (!(await this.isExists(username))) throw new EntityNotExists('Channel', username);
    if (await this.isCrawledContent(username, "CHANNEL_REELS")) {
      return this.mapperService.mapToChannelReelDTOs(await this.channelReelRepository.findBy({ channel: { username } }))
    }
    let reels: ChannelReel[] = await this.crawlService.crawlReels(username);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.channelReelRepository.save(reels)
      await this.writeCrawlHistory(username, ["CHANNEL_REELS"])
    })

    this.logger.log(`Fetch Reels Of User: ${username} Successfully`)
    return this.mapperService.mapToChannelReelDTOs(reels);
  }
}

