import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { CreateHashtagDTO } from './dto/create-hashtag.dto';
import FindAllHashtagDTO from './dto/findall-hashtag.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetHashtagParamsDTO {
  @IsOptional()
  @MaxLength(200)
  keyword: string;
}

@Controller('ins/hashtag')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  
  @Post()
  create(@Body() createHashtagDTO: CreateHashtagDTO) {
    return this.hashtagService.create(createHashtagDTO);
  }

  @Get()
  async findAll(@Query() queries: GetHashtagParamsDTO): Promise<FindAllHashtagDTO[]> {
    return this.hashtagService.findAll(queries);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hashtagService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hashtagService.remove(+id);
  }
}
