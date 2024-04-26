import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { Keyword } from '../entity/keyword.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Hashtag } from '../entity/hashtag.entity';
import { Channel } from '../entity/channel.entity';

export class GetHashtagNameParamsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;
}

@Controller('ins/keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Get(":name")
  async findOne(@Param() param: GetHashtagNameParamsDto): Promise<Keyword> {
    return this.keywordService.findOne(param.name);
  }

  @Get(':name/hashtags')
  async findHashtags(@Param() param: GetHashtagNameParamsDto): Promise<Hashtag[]> {
    return this.keywordService.findHashtags(param.name);
  }

  @Get(':name/channels')
  async findChannel(@Param() param: GetHashtagNameParamsDto): Promise<Channel[]> {
    return this.keywordService.findChannels(param.name);
  }

  @Get()
  async findAll(): Promise<Keyword[]> {
    return this.keywordService.findAll();
  }


  @Post()
  create(@Body() createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    return this.keywordService.create(createKeywordDto);
  }

  @Delete(':name')
  remove(@Param() param: GetHashtagNameParamsDto) {
    return this.keywordService.remove(param.name);
  }
}
