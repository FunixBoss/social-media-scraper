import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { Keyword } from '../entity/keyword.entity';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetHashtagNameParamsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;
}

@Controller('ins/keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Get(':name/hashtags')
  async findHashtags(@Param() param: GetHashtagNameParamsDto) {
    return this.keywordService.findHashtags(param.name);
  }

  @Get()
  async findAll(): Promise<Keyword[]> {
    return this.keywordService.findAll();
  }

  @Post()
  create(@Body() createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    return this.keywordService.create(createKeywordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keywordService.remove(+id);
  }
}
