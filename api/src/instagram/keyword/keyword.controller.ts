import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { Keyword } from '../entity/keyword.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Hashtag } from '../entity/hashtag.entity';
import { Channel } from '../entity/channel.entity';
import { FindOneKeywordDTO } from './dto/findone-keyword.dto';
import { FindAllKeywordDTO } from './dto/findall-keyword.dto';

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
  async findOne(@Param() param: GetHashtagNameParamsDto): Promise<FindOneKeywordDTO> {
    return this.keywordService.mapToFindOneKeywordDTO(param.name);
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
  async findAll(): Promise<FindAllKeywordDTO[]> {
    return this.keywordService.findAll();
  }

  @Post()
  create(@Body() createKeywordDto: CreateKeywordDto): Promise<FindOneKeywordDTO> {
    return this.keywordService.create(createKeywordDto);
  }

  @Delete(':name')
  remove(@Param() param: GetHashtagNameParamsDto) {
    return this.keywordService.remove(param.name);
  }
}
