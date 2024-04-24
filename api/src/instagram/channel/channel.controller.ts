import { Controller, Get, Post, Body, Param, Delete, Put, Inject, Query, ParseArrayPipe, ValidationPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import { Transform } from 'class-transformer';
import { ParseInfosPipe } from '../pipe/parse-infos.pipe';
import { InsScraperService } from '../scraper';

class ScrapeChannelQueryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;

  @IsNotEmpty()
  @IsValidScraperInfo()
  infos: string[];
}

@Controller('ins/channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly scraperService: InsScraperService
  ) { }

  @Get('scrape')
  async fetchChannel(@Query(ParseInfosPipe) query: ScrapeChannelQueryDto): Promise<any> {
      return await this.scraperService.fetchUserV2("_javadeveloper")
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.channelService.findOne(+id);
  }

  @Get()
  findAll() {
    return this.channelService.findAll();
  }

  @Post()
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto) {
    return this.channelService.update(+id, updateChannelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.channelService.remove(+id);
  }
}
