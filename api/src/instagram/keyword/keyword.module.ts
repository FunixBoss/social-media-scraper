import { Module } from '@nestjs/common';
import { KeywordService } from './service/keyword.service';
import { KeywordController } from './keyword.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Keyword } from "../entity/keyword.entity";
import { Hashtag } from '../entity/hashtag.entity';
import { PptrModule } from 'src/pptr/pptr.module';
import { Channel } from '../entity/channel.entity';
import { KeywordChannel } from '../entity/keyword-channel.entity';
import { ChannelModule } from '../channel/channel.module';
import KeywordCrawlService from './service/keyword-crawl.service';
import KeywordMapperService from './service/keyword-mapper.service';
import { ParseKeywordNamesPipe } from './pipe/ParseKeywordNamesPipe.pipe';

@Module({
  imports: [
    PptrModule,
    ChannelModule,
    TypeOrmModule.forFeature([
      Keyword, Hashtag, Channel, KeywordChannel
    ], 'instagram-scraper'),
  ],
  controllers: [
    KeywordController,
  ],
  providers: [
    KeywordService,
    KeywordCrawlService,
    KeywordMapperService,
    ParseKeywordNamesPipe
  ],
  exports: [
    KeywordService,
    KeywordCrawlService,
    KeywordMapperService 
  ]
})
export class KeywordModule { }
