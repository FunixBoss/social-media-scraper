import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ChannelService } from './service/channel.service';
import { ChannelController } from './channel.controller';
import { HelperModule } from 'src/helper/helper.module';
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
import { ChannelDownloadService } from './service/channel-download.service';
import { ChannelDownloadHistory } from '../entity/channel-download-history.entity';
import ChannelMapperService from './service/channel-mapper.service';
import ChannelHelper from './service/channel-helper.service';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { DownloadProcessor } from './processor/download.processor';
import { Queue } from 'bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ins-download-queue',
    }),
    HelperModule,
    TypeOrmModule.forFeature([
      Channel, ChannelFriendship, ChannelReel, ChannelReelHashtag, CrawlingType, Hashtag, Keyword, Priority,
      ChannelCrawlingHistory, ChannelPost, ChannelDownloadHistory
    ], 'instagram-scraper')
  ],
  controllers: [
    ChannelController
  ],
  providers: [
    ChannelService,
    ChannelDownloadService,
    ChannelMapperService,
    ChannelHelper,
    DownloadProcessor
  ],
  exports: [
    ChannelService,
    ChannelDownloadService,
    ChannelMapperService,
    ChannelHelper,
    DownloadProcessor,
  ]
})
export class ChannelModule implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectQueue('ins-download-queue') private readonly queue: Queue) { }

  async onModuleInit() {
    try {
      await this.cleanQueue()
      console.log('Queue cleaned successfully on startup.');
    } catch (error) {
      console.error('Error cleaning the queue on startup:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.cleanQueue()
      await this.queue.close();  // Close the queue
      console.log('Queue cleaned and closed successfully on shutdown.');
    } catch (error) {
      console.error('Error cleaning and closing the queue on shutdown:', error);
    }
  }

  async cleanQueue() {
    await this.queue.clean(0, 'completed');
    await this.queue.clean(0, 'wait');
    await this.queue.clean(0, 'active');
    await this.queue.clean(0, 'delayed');
    await this.queue.clean(0, 'failed');
  }
}