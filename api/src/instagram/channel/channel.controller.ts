import { Controller, Get, Post, Body, Param, Delete, Put, Inject, Query, ParseArrayPipe, ValidationPipe } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import { InsScraperService } from '../scraper';
import { IPaginatedPosts, ReelsIds} from '../scraper/types';
import { InsFriendshipUser, InsFriendshipUsers } from 'src/pptr-crawler/types/ins/InsFriendship';
import { InsProfile } from 'src/pptr-crawler/types/ins/InsProfile';
import { InsHighlights } from 'src/pptr-crawler/types/ins/InsHighlights';
import { InsPosts } from 'src/pptr-crawler/types/ins/InsPosts';
import InsUser from 'src/pptr-crawler/types/ins/InsUser';

export type ScrapeInfo = 'all' | 'profile' | 'highlights' | 'friendships' | 'posts' | 'reels'
class GetUserScrapeInfosDto {
  @IsNotEmpty()
  @IsValidScraperInfo()
  infos: ScrapeInfo[];
}

export class GetUserParamsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;
}

@Controller('ins/channel')
export class ChannelController {

  constructor(
    private readonly channelService: ChannelService,
    private readonly scraperService: InsScraperService,
  ) {}

  @Get(':username')
  async fetchUser(@Param() params: GetUserParamsDto, @Query() queries: GetUserScrapeInfosDto): Promise<InsUser> {
    return await this.channelService.fetchUser(params.username, queries.infos);
  }

  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUserParamsDto): Promise<InsProfile> {
    return await this.channelService.fetchUserProfile(params.username);
  }

  @Get(':username/posts')
  async fetchPosts(@Param() params: GetUserParamsDto): Promise<InsPosts> {
    return await this.channelService.fetchPosts(params.username)
  }

  @Get(':username/reels')
  async fetchReels(@Param() params: GetUserParamsDto): Promise<any> {
    return await this.channelService.fetchReels(params.username);
  }

  @Get(':username/friendships')
  async fetchFriendships(@Param() params: GetUserParamsDto): Promise<InsFriendshipUsers> {
    return await this.channelService.fetchFriendships(params.username);
  }

  @Get(':username/highlights')
  async fetchHighlights(@Param() params: GetUserParamsDto): Promise<InsHighlights> {
    return await this.channelService.fetchHighlights(params.username);
  }
}
