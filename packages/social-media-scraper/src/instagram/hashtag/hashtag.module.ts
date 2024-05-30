import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from '../entity/hashtag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hashtag
    ], 'instagram-scraper')
  ],
  controllers: [HashtagController],
  providers: [HashtagService],
})
export class HashtagModule {}
