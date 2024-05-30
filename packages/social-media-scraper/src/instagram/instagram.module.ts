import { Module } from '@nestjs/common';
import { KeywordModule } from './keyword/keyword.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ChannelModule } from './channel/channel.module';
import { ReelModule } from './reel/reel.module';
import { ScraperModule } from './scraper/scraper.module';
import { AccountModule } from './account/account.module';
import { PptrModule } from 'src/pptr/pptr.module';
import { ProxyModule } from 'src/proxy/proxy.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// const envData = process.env;
@Module({
  imports: [
    TypeOrmModule,
    PptrModule,
    ProxyModule,
    AccountModule,
    KeywordModule,
    HashtagModule,
    ChannelModule,
    ReelModule,
    ScraperModule,
  ],
  exports: [
    TypeOrmModule,
    KeywordModule,
    HashtagModule,
    ChannelModule,
    ReelModule,
    ScraperModule,
  ],
})
export class InstagramModule { }
