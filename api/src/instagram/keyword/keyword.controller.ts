import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { Keyword } from '../entity/keyword.entity';

@Controller('ins/keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keywordService.findOne(+id);
  }

  @Get()
  findAll() {
    return this.keywordService.findAll();
  }

  @Post()
  create(@Body() createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    return this.keywordService.create(createKeywordDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateKeywordDto: UpdateKeywordDto) {
    return this.keywordService.update(+id, updateKeywordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keywordService.remove(+id);
  }
}
