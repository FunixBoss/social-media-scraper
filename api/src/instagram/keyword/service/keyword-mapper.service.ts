import { Injectable, Logger } from "@nestjs/common";
import FindOneKeywordDTO from "../dto/findone-keyword.dto";
import { EntityNotExists } from "src/exception/entity-not-exists.exception";
import { InjectRepository } from "@nestjs/typeorm";
import { Keyword } from "src/instagram/entity/keyword.entity";
import { Repository } from "typeorm";
import ChannelMapperService from "src/instagram/channel/service/channel-mapper.service";
import FindAllKeywordDTO from "../dto/findall-keyword.dto";
import { KeywordChannel } from "src/instagram/entity/keyword-channel.entity";
import { Hashtag } from "src/instagram/entity/hashtag.entity";
import FindAllHashtagDTO from "src/instagram/hashtag/dto/findall-hashtag.dto";


@Injectable()
export default class KeywordMapperService {
    private readonly logger = new Logger(KeywordMapperService.name);

    constructor(
        @InjectRepository(KeywordChannel, 'instagram-scraper') private readonly keywordChannelRepository: Repository<KeywordChannel>,
        @InjectRepository(Hashtag, 'instagram-scraper') private readonly hashtagRepository: Repository<Hashtag>,
        @InjectRepository(Keyword, 'instagram-scraper') private readonly keywordRepository: Repository<Keyword>,
        private readonly channelMapperService: ChannelMapperService,
    ) {
    }

    private async isExists(keyword: string): Promise<boolean> {
        return await this.keywordRepository.existsBy({ name: keyword });
    }

    async mapToFindOneKeywordDTO(kw: string): Promise<FindOneKeywordDTO> {
        if (!(await this.isExists(kw))) throw new EntityNotExists('Keyword', kw);
        const keyword: Keyword = await this.keywordRepository.findOne({
            where: {
                name: kw
            },
            relations: [
                "keyword_channels", "keyword_channels.channel",
                "hashtags"
            ]
        })

        return {
            name: keyword.name,
            priority: keyword.priority,
            channels: await this.channelMapperService.mapToFindAllChannelDTOs(keyword.keyword_channels.map(ch => ch.channel)),
            hashtags: keyword.hashtags as any,
            total_hashtags: keyword.hashtags ? keyword.hashtags.length : 0,
            total_channels: keyword.keyword_channels ? keyword.keyword_channels.length : 0
        };
    }

    async mapToFindAllKeywordDTOs(keywords: Keyword[]): Promise<FindAllKeywordDTO[]> {
        let keywordDTOs: FindAllKeywordDTO[] = []
        for (const k of keywords) {
            const { name, priority } = k
            const total_channels: number = await this.keywordChannelRepository.countBy({
                keyword_name: k.name
            })
            const total_hashtags: number = await this.hashtagRepository.countBy({
                keyword: { name: k.name }
            })
            keywordDTOs.push({
                name,
                priority,
                total_channels,
                total_hashtags,
            })
        }
        return keywordDTOs;
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
}