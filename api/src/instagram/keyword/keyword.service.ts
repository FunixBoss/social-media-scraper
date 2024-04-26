import { Injectable, Put } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../entity/keyword.entity';
import { Repository } from 'typeorm';
import { Hashtag } from '../entity/hashtag.entity';
import { EntityAlreadyExists } from 'src/exception/entity-already-exists.exception';
import { InjectPage } from 'nestjs-puppeteer';
import { Page } from 'puppeteer';
import { RequestInterceptionManager } from 'puppeteer-intercept-and-modify-requests';
import { InsAPIWrapper } from 'src/pptr-crawler/types/ins/InsAPIWrapper';
import { InsHashtag, InsHashtags, InsSearching, InsSearchChannel, InsSearchChannels, mapInsHashtag, mapInsSearchChannel } from 'src/pptr-crawler/types/ins/InsSearch';
import { sleep } from 'src/pptr-crawler/utils/Utils';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { Channel } from '../entity/channel.entity';
import { KeywordChannel } from '../entity/keyword-channel.entity';

@Injectable()
export class KeywordService {
  private interceptManager: RequestInterceptionManager

  constructor(
    @InjectRepository(Keyword) private readonly keywordRepository: Repository<Keyword>,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Hashtag) private readonly hashtagRepository: Repository<Hashtag>,
    @InjectPage('instagram', 'social-media-scraper') private readonly page: Page
  ) {
    this.setUpPageInterceptors()
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

  private async isExists(keyword: string): Promise<boolean> {
    const kw: Keyword = await this.keywordRepository.findOneBy({
      name: keyword
    })
    return !!kw;
  }


  async create(createKeywordDto: CreateKeywordDto): Promise<Keyword> {

    const keyword = new Keyword();
    keyword.name = createKeywordDto.name;
    keyword.priority = createKeywordDto.priority.toUpperCase() || 'MEDIUM'; // Assign default value if priority is not provided

    const hashtagsFromKeyword: InsHashtags = await this.fetchHashtags(keyword);
    let hashtags: Hashtag[] = []
    for (let i = 0; i < hashtagsFromKeyword.len; i++) {
      const insHashtag: InsHashtag = hashtagsFromKeyword.hashtags[i];
      const hashtag: Hashtag = {
        code: insHashtag.name,
        media_count: insHashtag.media_count,
        priority: 'MEDIUM',
        classify: 'BOT_SCANNING',
      }
      hashtags.push(hashtag)
    }



    const channelsFromKeyword: InsSearchChannels = await this.fetchChannel(keyword);
    let channels: Channel[] = []
    let kwChannels: KeywordChannel[] = []
    for (let i = 0; i < channelsFromKeyword.len; i++) {
      const searchChannel: InsSearchChannel = channelsFromKeyword.channels[i];
      const channel: Channel = {
        username: searchChannel.username
      }
      channels.push(channel)

      const kwChannel: KeywordChannel = {
        keyword_name: keyword.name,
        channel_username: channel.username,
        status: 'DONE',
      }
      kwChannels.push(kwChannel)
    }

    this.channelRepository.save(channels);
    keyword.channels = kwChannels;
    return await this.keywordRepository.save(keyword);
  }

  private async fetchHashtags(keyword: Keyword): Promise<InsHashtags> {
    let hashtags: InsHashtags = { hashtags: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
            console.log("==> Found Response: Hashtags");
            const pagedHashtags: InsHashtag[] = await mapInsHashtag(dataObj.data as InsSearching);
            hashtags.hashtags.push(...pagedHashtags);
            hashtags.len += pagedHashtags.length
            console.log(hashtags.len);
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

  private async fetchChannel(keyword: Keyword): Promise<InsSearchChannels> {
    let channels: InsSearchChannels = { channels: [], len: 0 };
    await this.interceptManager.intercept({
      urlPattern: `https://www.instagram.com/api/graphql`,
      resourceType: 'XHR',
      modifyResponse: async ({ body }) => {
        try {
          const dataObj: InsAPIWrapper = JSON.parse(body);
          if (dataObj.data["xdt_api__v1__fbsearch__topsearch_connection"]) {
            console.log("==> Found Response: Search Channel");
            const pagedChannels: InsSearchChannel[] = await mapInsSearchChannel(dataObj.data as InsSearching);
            channels.channels.push(...pagedChannels);
            channels.len += pagedChannels.length
            console.log(channels.len);
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

  async findAll(): Promise<Keyword[]> {
    return this.keywordRepository.find()
  }

  findOne(id: number) {
    return `This action returns a #${id} keyword`;
  }

  update(id: number, updateKeywordDto: UpdateKeywordDto) {
    return `This action updates a #${id} keyword`;
  }

  remove(id: number) {
    return `This action removes a #${id} keyword`;
  }
}
