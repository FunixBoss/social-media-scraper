import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { HelperModule } from 'src/helper/helper.module';
import { ScraperModule } from '../scraper/scraper.module';

@Module({
  imports: [
    HelperModule,
    ScraperModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
