import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Inject } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { InsScraperService } from '../scraper';

@Controller('ins/channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    @Inject() readonly scraperService: InsScraperService
  ) {}

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
