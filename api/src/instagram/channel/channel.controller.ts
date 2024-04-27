import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { IsEmpty, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import InsUser from 'src/pptr-crawler/types/ins/InsUser';
import { Channel } from '../entity/channel.entity';
import { ChannelFriendship } from '../entity/channel-friendship.entity';
import { ChannelPost } from '../entity/channel-post.entity';
import { ChannelReel } from '../entity/channel-reel.entity';
import { IsNull } from 'typeorm';

export type ScrapeInfo = 'all' | 'profile' | 'friendships' | 'posts' | 'reels'
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

export class GetChannelsParamsDto {
  @IsEmpty()
  @IsIn([undefined, "username", "category", "follower_count", "full_name", "total_posts", "total_reels", "total_friendships"])
  sortField: string;

  @IsEmpty()
  @IsIn([undefined, "ASC", "DESC"])
  sortDirection: string;

  @IsOptional() 
  page: number;

  @IsOptional() 
  pageSize: number;

  @IsOptional()
  @MaxLength(200)
  username: string;

  @IsIn([undefined, "equals", "contains", "startsWith", "endsWith"])
  usernameFilterType: string;

  @IsOptional()
  @IsNumber()
  minFollower: number;

  @IsOptional()
  @IsNumber()
  maxFollower: number;

  @IsIn([undefined, "SELF_ADDING", "BOT_SCANNING"])
  classify: string;

  @IsIn([undefined, "LOW", "MEDIUM", "HIGH"])
  priority: string;
}

@Controller('ins/channel')
export class ChannelController {

  constructor(
    private readonly channelService: ChannelService,
  ) { }

  @Get('')
  async fetchAll(@Query() queries: GetChannelsParamsDto): Promise<Channel[]> {
    return await this.channelService.findAll(queries);
  }

  @Get(':username')
  async fetchUser(@Param() params: GetUserParamsDto, @Query() queries: GetUserScrapeInfosDto): Promise<InsUser> {
    return await this.channelService.fetchUser(params.username, queries.infos);
  }

  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUserParamsDto): Promise<Channel> {
    return await this.channelService.fetchUserProfile(params.username);
  }

  @Get(':username/friendships')
  async fetchFriendships(@Param() params: GetUserParamsDto): Promise<ChannelFriendship[]> {
    return await this.channelService.fetchFriendships(params.username);
  }

  @Get(':username/posts')
  async fetchPosts(@Param() params: GetUserParamsDto): Promise<ChannelPost[]> {
    return await this.channelService.fetchPosts(params.username)
  }

  @Get(':username/reels')
  async fetchReels(@Param() params: GetUserParamsDto): Promise<ChannelReel[]> {
    return await this.channelService.fetchReels(params.username);
  }


}
