import { Module } from '@nestjs/common';
import { ChannelService } from './service/channel.service';
import { ChannelController } from './channel.controller';
import { HelperModule } from 'src/helper/helper.module';
import { ScraperModule } from '../scraper/scraper.module';
import { PptrModule } from 'src/pptr/pptr.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { ChannelFriendship } from '../entity/channel-friendship.entity';
import { ChannelReel } from '../entity/channel-reel.entity';
import { ChannelReelHashtag } from '../entity/channel-reel-hashtag.entity';
import { CrawlingType } from '../entity/crawling-type.entity';
import { Hashtag } from '../entity/hashtag.entity';
import { Keyword } from '../entity/keyword.entity';
import { Priority } from '../entity/priority.entity';
import { ChannelCrawlingHistory } from '../entity/channel-crawling-history.entity';
import { ChannelPost } from '../entity/channel-post.entity';
import { ChannelExportService } from './service/channel-export.service';
import { ChannelDownloadService } from './service/channel-download.service';
import { ChannelDownloadHistory } from '../entity/channel-download-history.entity';
import ChannelCrawlService from './service/channel-crawl.service';
import ChannelMapperService from './service/channel-mapper.service';
import ChannelScraperService from './service/channel-scraper.service';
import ChannelHelper from './service/channel-helper.service';

@Module({
  imports: [
    HelperModule,
    ScraperModule,
    PptrModule,
    TypeOrmModule.forFeature([
      Channel, ChannelFriendship, ChannelReel, ChannelReelHashtag, CrawlingType, Hashtag, Keyword, Priority,
      ChannelCrawlingHistory, ChannelPost, ChannelDownloadHistory
    ], 'instagram-scraper')
  ],
  controllers: [ChannelController],
  providers: [
    ChannelService,
    ChannelExportService,
    ChannelDownloadService,
    ChannelCrawlService,
    ChannelMapperService,
    ChannelScraperService,
    ChannelHelper
  ],
  exports: [
    ChannelService,
    ChannelExportService,
    ChannelDownloadService,
    ChannelCrawlService,
    ChannelMapperService,
    ChannelScraperService,
    ChannelHelper
  ]
})
export class ChannelModule { }
