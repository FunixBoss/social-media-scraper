import { Injectable } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../entity/keyword.entity';
import { DataSource, Repository } from 'typeorm';
import { Hashtag } from '../entity/hashtag.entity';
import { EntityAlreadyExists } from 'src/exception/entity-already-exists.exception';
import { Browser, Page } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsAPIWrapper } from 'src/pptr/types/ins/InsAPIWrapper';
import { InsSearching, mapInsHashtag, mapInsSearchChannel } from 'src/pptr/types/ins/InsSearch';
import { sleep } from 'src/pptr/utils/Utils';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { Channel } from '../entity/channel.entity';
import { KeywordChannel } from '../entity/keyword-channel.entity';
import FindOneKeywordDTO from './dto/findone-keyword.dto';
import FindAllKeywordDTO from './dto/findall-keyword.dto';
import FindAllHashtagDTO from '../hashtag/dto/findall-hashtag.dto';
import FindAllChannelDTO from '../channel/dto/findall-channel.dto';
import { ChannelService } from '../channel/service/channel.service';
import ChannelMapperService from '../channel/service/channel-mapper.service';
import ChannelCrawlService from '../channel/service/channel-crawl.service';
import { PptrBrowserManagement } from 'src/pptr/service/pptr-browser-management.service';

@Injectable()
export class KeywordService {
  private interceptManager: RequestInterceptionManager;
  private browser: Browser;
  private page: Page;
  constructor(
    private readonly channelService: ChannelService,
    private readonly crawlService: ChannelCrawlService,
    @InjectRepository(Keyword) private readonly keywordRepository: Repository<Keyword>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Hashtag) private readonly hashtagRepository: Repository<Hashtag>,
    @InjectRepository(KeywordChannel) private readonly keywordChannelRepository: Repository<KeywordChannel>,
    private readonly browserManagement: PptrBrowserManagement,
    private readonly dataSource: DataSource,
    private readonly mapperService: ChannelMapperService
  ) {
    this.onInit()
  }

  private async onInit() {
    this.browser = this.browserManagement.getBrowser('instagram');
    await sleep(60)
    this.page = (await this.browser.pages()).at(0)
    this.setUpPageInterceptors()
  }

  async mapToFindOneKeywordDTO(kw: string): Promise<FindOneKeywordDTO> {
    if (!(await this.isExists(kw))) throw new EntityNotExists('Keyword', kw);
    const keyword: Keyword = await this.keywordRepository.findOne({
      where: {
        name: kw
      },
      relations: [
        "channels", "channels.channel",
        "hashtags"
      ]
    })

    return {
      name: keyword.name,
      priority: keyword.priority,
      channels: await this.mapperService.mapToFindAllChannelDTOs(keyword.channels.map(ch => ch.channel)),
      hashtags: keyword.hashtags as any,
      total_hashtags: keyword.hashtags ? keyword.hashtags.length : 0,
      total_channels: keyword.channels ? keyword.channels.length : 0
    };
  }

  async mapToFindAllKeywordDTOs(keywords: Keyword[]): Promise<FindAllKeywordDTO[]> {
    let keywordDtos: FindAllKeywordDTO[] = []
    for (const k of keywords) {
      const { name, priority } = k
      const total_channels: number = await this.keywordChannelRepository.countBy({
        keyword_name: k.name
      })
      const total_hashtags: number = await this.hashtagRepository.countBy({
        keyword: { name: k.name }
      })
      keywordDtos.push({
        name,
        priority,
        total_channels,
        total_hashtags,
      })
    }
    return keywordDtos;
  }

  async mapToFindAllHashtagDTOs(hashtags: Hashtag[]): Promise<FindAllHashtagDTO[]> {
    return hashtags.map(h => {
      const { id, code, media_count, category, is_self_adding, is_bot_scanning, priority } = h
      return {
        id,
        code,
        media_count,
        category,
        is_self_adding,
        is_bot_scanning,
        priority,
        keyword: h.keyword ? h.keyword.name : null
      }
    });
  }


  async findAll(): Promise<FindAllKeywordDTO[]> {
    const keywords: Keyword[] = await this.keywordRepository.find({
      relations: [
        "channels", "channels.channel",
        "hashtags"
      ]
    })

    return keywords.map(kw => {
      return {
        name: kw.name,
        priority: kw.priority,
        total_channels: kw.channels.length,
        total_hashtags: kw.hashtags.length
      }
    })
  }

  private async isExists(keyword: string): Promise<boolean> {
    const kw: Keyword = await this.keywordRepository.findOneBy({
      name: keyword
    })
    return !!kw;
  }



  private async setUpPageInterceptors(): Promise<void> {
    this.interceptManager = new RequestInterceptionManager(
      (await this.page.target().createCDPSession()) as any,
      {
        onError: (error) => {
          console.error('Request interception error:', error)
        },
      }
    )
  }


  async findOne(keyword: string): Promise<FindOneKeywordDTO> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    return this.mapToFindOneKeywordDTO(keyword);
  }

  async create(createKeywordDto: CreateKeywordDto): Promise<FindOneKeywordDTO> {
    if ((await this.isExists(createKeywordDto.name))) throw new EntityAlreadyExists('Keyword', createKeywordDto.name);

    try {
      const keyword = new Keyword();
      keyword.name = createKeywordDto.name;
      keyword.priority = createKeywordDto.priority.toUpperCase() || 'MEDIUM'; // Assign default value if priority is not provided

      const hashtags: Hashtag[] = await this.fetchHashtags(keyword);
      hashtags.forEach(hashtag => hashtag.keyword = { name: keyword.name });

      const channelUsernames: string[] = await this.fetchChannelUsernames(keyword);
      const channels: Channel[] = await this.crawlService.crawlProfiles(channelUsernames)

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
          this.channelService.writeCrawlHistory(channel.username, ["CHANNEL_PROFILE"])
        ));
        keyword.channels = kwChannels;
        keyword.hashtags = hashtags;
        await this.keywordRepository.save(keyword)
      })
      return this.mapToFindOneKeywordDTO(keyword.name);
    } catch (error) {
      console.log(error);
    }
  }

  private async fetchHashtags(keyword: Keyword): Promise<Hashtag[]> {
    let hashtags: Hashtag[] = [];
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
            console.log("==> Found Response: Hashtags");
            const pagedHashtags: Hashtag[] = await mapInsHashtag(dataObj.data as InsSearching);
            hashtags.push(...pagedHashtags);
          }
        } catch (error) {
          console.log(error);
        }
      }
    })
    await this.page.goto('https://instagram.com/', { waitUntil: 'networkidle2' });
    await this.page.evaluate(`document.querySelectorAll('span[aria-describedby^=":r"] a')[1].click()`);
    await this.page.type('input[aria-label^="Search"]', `#${keyword.name}`);
    await sleep(3);
    return hashtags;
  }

  private async fetchChannelUsernames(keyword: Keyword): Promise<string[]> {
    let channels: Channel[] = [];
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
            console.log("==> Found Response: Search Channel");
            const pagedChannels: Channel[] = await mapInsSearchChannel(dataObj.data as InsSearching);
            channels.push(...pagedChannels);
          }
        } catch (error) {
          console.log(error);
        }
      }
    })
    await this.page.goto('https://instagram.com/', { waitUntil: 'networkidle2' });
    await this.page.evaluate(`document.querySelectorAll('span[aria-describedby^=":r"] a')[1].click()`);
    await this.page.type('input[aria-label^="Search"]', `${keyword.name}`);
    await sleep(3);
    return channels.map(ch => ch.username);
  }

  async findHashtags(keyword: string): Promise<FindAllHashtagDTO[]> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    return this.mapToFindAllHashtagDTOs(await this.hashtagRepository.findBy({ keyword: { name: keyword } }))
  }

  async findChannels(keywordName: string): Promise<FindAllChannelDTO[]> {
    if (!(await this.isExists(keywordName))) throw new EntityNotExists('Keyword', keywordName);
    const keyword = await this.keywordRepository.findOne({
      where: { name: keywordName },
      relations: ['channels', 'channels.channel']
    });
    return this.mapperService.mapToFindAllChannelDTOs(keyword.channels.map(keywordChannel => keywordChannel.channel));
  }

  async remove(keyword: string): Promise<void> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    await this.dataSource.transaction(async (transactionalEntityManager) => {
      await this.keywordChannelRepository.delete({ keyword_name: keyword });
      await this.hashtagRepository.delete({
        keyword: {
          name: keyword
        }
      });
      await this.keywordRepository.delete({ name: keyword });
    })
  }
}
