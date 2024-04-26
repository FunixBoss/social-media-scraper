import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { HelperModule } from 'src/helper/helper.module';
import { ScraperModule } from '../scraper/scraper.module';
import { PptrCrawlerModule } from 'src/pptr-crawler/pptr-crawler.module';

@Module({
  imports: [
    HelperModule,
    ScraperModule,
    PptrCrawlerModule, 
  ],
  controllers: [ChannelController],
  providers: [
    ChannelService,
  ],
})
export class ChannelModule {}
