import { Injectable } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Keyword } from '../entity/keyword.entity';
import { Repository } from 'typeorm';
import { Hashtag } from '../entity/hashtag.entity';

@Injectable()
export class KeywordService {

  constructor(
    @InjectRepository(Keyword) private readonly keywordRepository: Repository<Keyword>,
    @InjectRepository(Hashtag) private readonly hashtagRepository: Repository<Hashtag>,
  ) { }

  async create(createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    // Create a new Keyword entity
    const keyword = new Keyword();
    keyword.name = createKeywordDto.name;
    keyword.priority = createKeywordDto.priority.toUpperCase() || 'MEDIUM'; // Assign default value if priority is not provided
    
    const hashtagsFromKeyword: Hashtag[] = await this.generateHashtagsFromKeyword(keyword);
    this.hashtagRepository.save(hashtagsFromKeyword);


    // Save the new Keyword entity to the database
    return await this.keywordRepository.save(keyword);
  }

  private async generateHashtagsFromKeyword(keyword: Keyword): Promise<Hashtag[]> {
    return null;
  } 
  
  findAll() {
    return `This action returns all keyword`;
  }

  findOne(id: number) {
    return `This action returns a #${id} keyword`;
  }

  update(id: number, updateKeywordDto: UpdateKeywordDto) {
    return `This action updates a #${id} keyword`;
  }

  remove(id: number) {
    return `This action removes a #${id} keyword`;
  }
}
