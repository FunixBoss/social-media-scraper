import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { HelperModule } from 'src/helper/helper.module';
import { ScraperModule } from '../scraper/scraper.module';
import { PptrCrawlerModule } from 'src/pptr-crawler/pptr-crawler.module';
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
import { ChannelExportService } from './channel-export.service';
import { ChannelDownloadService } from './channel-download.service';

@Module({
  imports: [
    HelperModule,
    ScraperModule,
    PptrCrawlerModule,
    TypeOrmModule.forFeature([
      Channel, ChannelFriendship, ChannelReel, ChannelReelHashtag, CrawlingType, Hashtag, Keyword, Priority,
      ChannelCrawlingHistory, ChannelPost
    ])
  ],
  controllers: [ChannelController],
  providers: [
    ChannelService,
    ChannelExportService,
    ChannelDownloadService
  ],
  exports: [
    ChannelService,
    ChannelExportService,
    ChannelDownloadService
  ]
})
export class ChannelModule { }
