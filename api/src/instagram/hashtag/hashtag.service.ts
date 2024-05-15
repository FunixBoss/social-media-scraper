import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import FindAllHashtagDTO from './dto/findall-hashtag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from '../entity/hashtag.entity';
import { Repository } from 'typeorm';
import { GetHashtagParamsDto } from './hashtag.controller';

@Injectable()
export class HashtagService {

  constructor(
    @InjectRepository(Hashtag, 'instagram-scraper') private readonly hashtagRepository: Repository<Hashtag>,
  ) {}

  create(createHashtagDto: CreateHashtagDto) {
    return 'This action adds a new hashtag';
  }

  async mapToFindAllHashtagDTOs(hashtags: Hashtag[]): Promise<FindAllHashtagDTO[]> {
    return hashtags.map(h => {
      const { id, code, media_count, category, is_self_adding, is_bot_scanning, priority } = h
      return {
        id,
        code,
        media_count,
        category,
        is_self_adding,
        is_bot_scanning,
        priority,
        keyword: h.keyword ? h.keyword.name : null
      }
    });
  }

  async findAll(queries: GetHashtagParamsDto): Promise<FindAllHashtagDTO[]> {
    let hashtags: Hashtag[] = []
    if(queries.keyword) {
      hashtags = await this.hashtagRepository.find({
        where: {
          keyword: {name: queries.keyword}
        }
      })
    } else {
      hashtags = await this.hashtagRepository.find();
    }
    return this.mapToFindAllHashtagDTOs(hashtags)
  }

  findOne(id: number) {
    return `This action returns a #${id} hashtag`;
  }

  remove(id: number) {
    return `This action removes a #${id} hashtag`;
  }
}
