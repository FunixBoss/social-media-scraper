import { Injectable } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../entity/keyword.entity';
import { DataSource, Repository } from 'typeorm';
import { Hashtag } from '../entity/hashtag.entity';
import { EntityAlreadyExists } from 'src/exception/entity-already-exists.exception';
import { InjectPage } from 'nestjs-puppeteer';
import { Page } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsAPIWrapper } from 'src/pptr-crawler/types/ins/InsAPIWrapper';
import { InsSearching, mapInsHashtag, mapInsSearchChannel } from 'src/pptr-crawler/types/ins/InsSearch';
import { sleep } from 'src/pptr-crawler/utils/Utils';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { Channel } from '../entity/channel.entity';
import { KeywordChannel } from '../entity/keyword-channel.entity';
import { FindOneKeywordDTO } from './dto/findone-keyword.dto';
import { FindAllKeywordDTO } from './dto/findall-keyword.dto';

@Injectable()
export class KeywordService {
  private interceptManager: RequestInterceptionManager

  constructor(
    @InjectRepository(Keyword) private readonly keywordRepository: Repository<Keyword>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Hashtag) private readonly hashtagRepository: Repository<Hashtag>,
    @InjectRepository(KeywordChannel) private readonly keywordChannelRepository: Repository<KeywordChannel>,
    @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
    private readonly dataSource: DataSource
  ) {
    this.setUpPageInterceptors()
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

  async mapToFindOneKeywordDTO(kw: string): Promise<FindOneKeywordDTO> {
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
      channels: keyword.channels.map(ch => ch.channel),
      hashtags: keyword.hashtags,
      total_hashtags: keyword.hashtags ? keyword.hashtags.length : 0,
      total_channels: keyword.channels ? keyword.channels.length : 0
    } as FindOneKeywordDTO;
  }

  private async setUpPageInterceptors(): Promise<void> {
    this.interceptManager = new RequestInterceptionManager(
      await this.page.target().createCDPSession(),
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

      const channels: Channel[] = await this.fetchChannel(keyword);
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
        await this.channelRepository.save(channels);
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

  private async fetchChannel(keyword: Keyword): Promise<Channel[]> {
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
    return channels;
  }

  async findHashtags(keyword: string): Promise<Hashtag[]> {
    if (!(await this.isExists(keyword))) throw new EntityNotExists('Keyword', keyword);
    return this.hashtagRepository.findBy({
      keyword: {
        name: keyword
      }
    })
  }

  async findChannels(keywordName: string): Promise<Channel[]> {
    if (!(await this.isExists(keywordName))) throw new EntityNotExists('Keyword', keywordName);
    const keyword = await this.keywordRepository.findOne({
      where: { name: keywordName },
      relations: ['channels', 'channels.channel']
    });
    return keyword.channels.map(keywordChannel => keywordChannel.channel);
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
