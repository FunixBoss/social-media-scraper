import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChannelCrawlingHistory } from "src/instagram/entity/channel-crawling-history.entity";
import { Channel } from "src/instagram/entity/channel.entity";
import { CrawlingType, TCrawlingType } from "src/instagram/entity/crawling-type.entity";
import { Repository } from "typeorm";

@Injectable()
export default class ChannelHelper {

    constructor(
        @InjectRepository(Channel, 'instagram-scraper') private readonly channelRepository: Repository<Channel>,
        @InjectRepository(CrawlingType, 'instagram-scraper') private readonly crawlingTypeRepository: Repository<CrawlingType>,
        @InjectRepository(ChannelCrawlingHistory, 'instagram-scraper') private readonly channelCrawlRepository: Repository<ChannelCrawlingHistory>,
        @InjectRepository(ChannelCrawlingHistory, 'instagram-scraper') private readonly channelCrawlingHistoryRepository: Repository<ChannelCrawlingHistory>,
    ) {

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
}