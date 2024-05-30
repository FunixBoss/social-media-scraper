import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../../entity/keyword.entity';
import { DataSource, Repository } from 'typeorm';
import { Hashtag } from '../../entity/hashtag.entity';
import { EntityAlreadyExists } from 'src/exception/entity-already-exists.exception';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { Channel } from '../../entity/channel.entity';
import { KeywordChannel } from '../../entity/keyword-channel.entity';
import FindOneKeywordDTO from '../dto/findone-keyword.dto';
import FindAllKeywordDTO from '../dto/findall-keyword.dto';
import FindAllHashtagDTO from '../../hashtag/dto/findall-hashtag.dto';
import FindAllChannelDTO from '../../channel/dto/findall-channel.dto';
import ChannelMapperService from '../../channel/service/channel-mapper.service';
import KeywordMapperService from './keyword-mapper.service';
import KeywordCrawlService from './keyword-crawl.service';
import { sleep } from 'src/pptr/utils/Utils';
import ChannelHelper from 'src/instagram/channel/service/channel-helper.service';
import ChannelScraperService from 'src/instagram/channel/service/channel-scraper.service';
import { ChannelCrawlConfig } from 'src/config/crawl-settings.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeywordService {
  private readonly logger = new Logger(KeywordService.name);
  private readonly crawlConfig: ChannelCrawlConfig

  constructor(
    private readonly channelHelper: ChannelHelper,
    private readonly channelMapper: ChannelMapperService,
    private readonly channelScraper: ChannelScraperService,
    private readonly keywordCrawlService: KeywordCrawlService,
    private readonly keywordMapperService: KeywordMapperService,
    @InjectRepository(Keyword, 'instagram-scraper') private readonly keywordRepository: Repository<Keyword>,
    @InjectRepository(Channel, 'instagram-scraper') private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Hashtag, 'instagram-scraper') private readonly hashtagRepository: Repository<Hashtag>,
    @InjectRepository(KeywordChannel, 'instagram-scraper') private readonly keywordChannelRepository: Repository<KeywordChannel>,
    @InjectDataSource('instagram-scraper') private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.crawlConfig = configService.get<ChannelCrawlConfig>('channel')
  }

  private async isExists(keyword: string): Promise<boolean> {
    return await this.keywordRepository.existsBy({ name: keyword });
  }

  //#region crud
  async findOne(keyword: string): Promise<FindOneKeywordDTO> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    return this.keywordMapperService.mapToFindOneKeywordDTO(keyword);
  }

  async findAll(): Promise<FindAllKeywordDTO[]> {
    const keywords: Keyword[] = await this.keywordRepository.find({
      relations: [
        "keyword_channels", "keyword_channels.channel",
        "hashtags"
      ]
    })

    return keywords.map(kw => {
      return {
        name: kw.name,
        priority: kw.priority,
        total_channels: kw.keyword_channels.length,
        total_hashtags: kw.hashtags.length
      }
    })
  }

  async findHashtags(keyword: string): Promise<FindAllHashtagDTO[]> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    return this.keywordMapperService.mapToFindAllHashtagDTOs(await this.hashtagRepository.findBy({ keyword: { name: keyword } }))
  }

  async findChannels(keywordName: string): Promise<FindAllChannelDTO[]> {
    if (!(await this.isExists(keywordName))) throw new EntityNotExists('Keyword', keywordName);
    const keyword = await this.keywordRepository.findOne({
      where: { name: keywordName },
      relations: ['keyword_channels', 'keyword_channels.channel']
    });
    return this.channelMapper.mapToFindAllChannelDTOs(keyword.keyword_channels.map(keywordChannel => keywordChannel.channel));
  }

  async createMultiKeyword(keywords: string[]): Promise<FindOneKeywordDTO[]> {
    const keywordDTOs: FindOneKeywordDTO[] = []
    const keywordLen: number = keywords.length;
    for (const [index, keyword] of keywords.entries()) {
      try {
        keywordDTOs.push(await this.create(keyword, { log: false }));
        this.logger.log(`Crawl keyword successfully (${index + 1}/${keywordLen}): ${keyword}`)
        await sleep(2);
      } catch (error) {
        this.logger.error(`Crawl keyword failed (${index + 1}/${keywordLen}): ${keyword}, Error: ${error["name"]} - ${error["message"]}`)
      }
    }
    return keywordDTOs;
  }

  async create(name: string, options: { log?: boolean } = { log: true }): Promise<FindOneKeywordDTO> {
    if ((await this.isExists(name))) throw new EntityAlreadyExists('Keyword', name);

    // get hashtag/username from keywword
    const keyword: Keyword = { name: name, priority: 'MEDIUM' }
    const hashtags: Hashtag[] = await this.keywordCrawlService.crawlHashtags(keyword);
    hashtags.forEach(hashtag => hashtag.keyword = { name: keyword.name });
    const channelUsernames: string[] = await this.keywordCrawlService.crawlUsernames(keyword);

    const channels: Channel[] = (await this.channelScraper.scrapeProfiles(channelUsernames))
      .filter(ch => ch.follower_count >= this.crawlConfig.profile.min_follower)
    this.logger.log(`Filtered channels follower under ${this.crawlConfig.profile.min_follower}`)
    const channelsLen: number = channels.length

    let kwChannels: KeywordChannel[] = []
    for (let i = 0; i < channelsLen; i++) {
      const channel: Channel = channels[i]
      const kwChannel: KeywordChannel = {
        keyword_name: keyword.name,
        channel_username: channel.username,
        status: 'DONE',
      }
      kwChannels.push(kwChannel)
    }
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.keywordRepository.save(keyword)
      await this.channelRepository.save(channels);
      await Promise.all(channels.map(channel =>
        this.channelHelper.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])
      ));
      keyword.keyword_channels = kwChannels;
      keyword.hashtags = hashtags;
      await this.keywordRepository.save(keyword)
    })
    if (options.log) this.logger.log(`Crawl keyword successfully, keyword: ${keyword.name} - Hashtags: ${hashtags.length}, Channels: ${channels.length}`)
    return this.keywordMapperService.mapToFindOneKeywordDTO(keyword.name);
  }
 
  async remove(keyword: string): Promise<void> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(Keyword, { name: keyword });
    });
  }
  //#endregion
}
