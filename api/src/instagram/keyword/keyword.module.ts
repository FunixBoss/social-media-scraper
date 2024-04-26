import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Keyword } from "../entity/keyword.entity";
import { Hashtag } from '../entity/hashtag.entity';
import { PptrCrawlerModule } from 'src/pptr-crawler/pptr-crawler.module';
import { Channel } from '../entity/channel.entity';
import { KeywordChannel } from '../entity/keyword-channel.entity';

@Module({
  imports: [
    PptrCrawlerModule,
    TypeOrmModule.forFeature([
      Keyword, Hashtag, Channel, KeywordChannel
    ]),
  ],
  controllers: [
    KeywordController,
  ],
  providers: [KeywordService],
})
export class KeywordModule { }
