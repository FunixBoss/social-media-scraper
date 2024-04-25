import { Controller, Get, Post, Body, Param, Delete, Put, Inject, Query, ParseArrayPipe, ValidationPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import { InsScraperService } from '../scraper';
import { HMedia, IPaginatedPosts, ReelsIds} from '../scraper/types';
import { InsReel, InsReels } from 'src/pptr-crawler/types/ins/InsReels';

class ScrapeChannelQueryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;

  @IsNotEmpty()
  @IsValidScraperInfo()
  infos: string[];
}

class ScrapeChannelUsername {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;
}

export class GetUserParamsDto {
  @IsNotEmpty()
  @IsString()
  username: string;
}

@Controller('ins/channel')
export class ChannelController {

  constructor(
    private readonly channelService: ChannelService,
    private readonly scraperService: InsScraperService,
  ) {}

  @Get(':username')
  async fetchUser(@Param() params: GetUserParamsDto): Promise<any> {
  }


  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUserParamsDto): Promise<any> {
    return await this.channelService.fetchUserProfile(params.username);
  }

  @Get(':username/posts')
  async fetchPosts(@Param() params: GetUserParamsDto): Promise<IPaginatedPosts> {
    return await this.scraperService.fetchUserPosts(params.username)
  }

  @Get(':username/reelIds')
  async fetchReelIds(@Param() params: GetUserParamsDto): Promise<ReelsIds[]> {
    return await this.scraperService._getReelsIds(params.username)
  }

  @Get(':username/reels')
  async fetchReels(@Param() params: GetUserParamsDto): Promise<any> {
    return await this.channelService.fetchReels(params.username);
  }

  @Get(':username/stories')
  async fetchStories(@Param() params: GetUserParamsDto): Promise<any> {

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
