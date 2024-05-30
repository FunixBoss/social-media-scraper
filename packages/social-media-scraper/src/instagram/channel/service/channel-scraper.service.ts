import { Injectable } from "@nestjs/common";
import { Channel } from "src/instagram/entity/channel.entity";
import ScraperService, { ScrapeProfilesResult } from "src/instagram/scraper/service/scraper.service";
import ChannelCrawlService from "./channel-crawl.service";

@Injectable()
export default class ChannelScraperService {
    constructor(
        private readonly scraperService: ScraperService,
        private readonly crawlService: ChannelCrawlService,
    ) { }

    async scrapeProfiles(usernames: string[]): Promise<Channel[]> {
        let scraperResult: ScrapeProfilesResult = await this.scraperService.scrapeUserProfiles(usernames);
        let scrapeChannels: Channel[] = scraperResult.channels;
        let crawledChannels: Channel[] = []
        if (scraperResult.scrapeFailedUsernames.length > 0) {
            crawledChannels = await this.crawlService.crawlProfiles(scraperResult.scrapeFailedUsernames)
        }

        return [
            ...crawledChannels,
            ...scrapeChannels.filter(ch => ch.username)
        ]
    }
}