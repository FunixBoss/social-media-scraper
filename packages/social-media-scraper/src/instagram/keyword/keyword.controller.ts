import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { KeywordService } from './service/keyword.service';
import { CreateKeywordDTO } from './dto/create-keyword.dto';
import FindOneKeywordDTO from './dto/findone-keyword.dto';
import FindAllKeywordDTO from './dto/findall-keyword.dto';
import FindAllHashtagDTO from '../hashtag/dto/findall-hashtag.dto';
import FindAllChannelDTO from '../channel/dto/findall-channel.dto';
import KeywordMapperService from './service/keyword-mapper.service';
import { GetKeywordNameParamsDTO } from './dto/get-keyword-name-params.dto';
import { GetHashtagNameParamsDTO } from './dto/get-hashtag-name-params.dto';
import { CreateMultiKeywordDTO } from './dto/create-multi-keyword.dto';
import { ParseKeywordNamesPipe } from './pipe/ParseKeywordNamesPipe.pipe';

@Controller('ins/keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService,
    private readonly mapperService: KeywordMapperService
  ) { }

  @Get(":name")
  async findOne(@Param() param: GetKeywordNameParamsDTO): Promise<FindOneKeywordDTO> {
    return this.mapperService.mapToFindOneKeywordDTO(param.name);
  }

  @Get(':name/hashtags')
  async findHashtags(@Param() param: GetHashtagNameParamsDTO): Promise<FindAllHashtagDTO[]> {
    return this.keywordService.findHashtags(param.name);
  }

  @Get(':name/channels')
  async findChannel(@Param() param: GetKeywordNameParamsDTO): Promise<FindAllChannelDTO[]> {
    return this.keywordService.findChannels(param.name);
  }

  @Get()
  async findAll(): Promise<FindAllKeywordDTO[]> {
    return this.keywordService.findAll();
  }
 
  @Post()
  create(@Body() createKeywordDTO: CreateKeywordDTO): Promise<FindOneKeywordDTO> {
    return this.keywordService.create(createKeywordDTO.name);
  }

  @Post('create-multi')
  createMulti(@Body(ParseKeywordNamesPipe) createKeywordDTO: CreateMultiKeywordDTO): Promise<FindOneKeywordDTO[]> {
    return this.keywordService.createMultiKeyword(createKeywordDTO.name);
  }

  @Delete(':name')
  remove(@Param() param: GetKeywordNameParamsDTO) {
    return this.keywordService.remove(param.name);
  }
}
