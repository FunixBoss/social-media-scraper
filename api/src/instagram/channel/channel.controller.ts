import { ChannelDownloadHistoryDTO } from './dto/channel-download-history.dto';
import { Controller, Get, Param, Query, Res, UsePipes } from '@nestjs/common';
import { ChannelService } from './service/channel.service';
import { IsEmpty, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import type { Response } from 'express';
import FindAllChannelDTO from './dto/findall-channel.dto';
import ChannelPostDTO from './dto/channel-post.dto';
import ChannelReelDTO from './dto/channel-reel.dto';
import FindOneChannelDTO from './dto/findone-channel.dto';
import { ChannelExportService } from './service/channel-export.service';
import { ChannelDownloadService } from './service/channel-download.service';
import { Type } from 'class-transformer';
import { ParseCommaSeparatedQuery } from 'src/pipes/parse-comma-separate-query.pipe';

export type ScrapeInfo = 'all' | 'profile' | 'friendships' | 'posts' | 'reels'
class GetUserScrapeInfosDto {
  @IsNotEmpty()
  @IsValidScraperInfo()
  infos: ScrapeInfo[];
}


export class GetDownloadTypeDto {
  @IsIn(["posts", "reels"])
  type: string;

  @Type(() => Number)
  @IsNumber()
  from_order: number;

  @Type(() => Number)
  @IsNumber()
  to_order: number;
}
export class GetExportTypeDto {
  @IsIn(["excel", "json"])
  type: string;
}

export class GetUserNIdParamsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  username: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;
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
    private readonly channelExportService: ChannelExportService,
    private readonly channelDownloadService: ChannelDownloadService,
  ) { }
  
  //#region Download
  @Get('download/:username/findall')
  async findAllDownloads(@Param() params: GetUserParamsDto): Promise<ChannelDownloadHistoryDTO[]> {
    return await this.channelDownloadService.findAllDownloadHistories(params.username);
  }

  @Get('download/:username/:id')
  async downloadReelsWithId(@Param() params: GetUserNIdParamsDto): Promise<{ message: string }> {
    this.channelDownloadService.downloadById(params.username, params.id);
    return { message: "Downloading" };
  }

  @Get('download/:username')
  async download(@Param() params: GetUserParamsDto, @Query() queries: GetDownloadTypeDto): Promise<{ message: string }>{
    this.channelDownloadService.download(params.username, queries.type, queries.from_order, queries.to_order);
    return { message: "Downloading" };
  }
  //#endregion

  //#region export
  @Get('export')
  async exportChannels(@Res({ passthrough: true }) res: Response, @Query() queries: GetExportTypeDto): Promise<{ message: string }> {
    this.channelExportService.exportChannels(queries.type);
    return { message: "Exporting" };
  }

  @Get('export/:username')
  async exportChannel(
    @Res({ passthrough: true }) res: Response,
    @Param() params: GetUserParamsDto,
    @Query() queries: GetExportTypeDto): Promise<{ message: string }> {
    this.channelExportService.exportChannel(params.username, queries.type);
    return { message: "Exporting" };
  }
  //#endregion

  //#region Fetch
  @Get('')
  async fetchAll(@Query() queries: GetChannelsParamsDto): Promise<FindAllChannelDTO[]> {
    return await this.channelService.findAll(queries);
  }

  @Get(':username')
  async fetchUser(@Param() params: GetUserParamsDto, @Query() queries: GetUserScrapeInfosDto): Promise<FindOneChannelDTO> {
    return await this.channelService.fetchUser(params.username, queries.infos);
  }

  @Get('scrape/profile')
  @UsePipes(ParseCommaSeparatedQuery)
  getUsersByUsernames(@Query('usernames') usernames: string[]): Promise<FindAllChannelDTO[]> {
    return this.channelService.fetchUserProfiles(usernames);
  }

  @Get(":username/exists")
  async isChannelExist(@Param() params: GetUserParamsDto): Promise<boolean> {
    try {
      await this.channelService.fetchUserProfile(params.username);
      return true;
    } catch (error) {
      return false
    }
  }

  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUserParamsDto): Promise<FindAllChannelDTO> {
    return this.channelService.fetchUserProfile(params.username);
  }

  @Get(':username/friendships')
  async fetchFriendships(@Param() params: GetUserParamsDto): Promise<FindAllChannelDTO[]> {
    return await this.channelService.fetchFriendships(params.username);
  }

  @Get(':username/posts')
  async fetchPosts(@Param() params: GetUserParamsDto): Promise<ChannelPostDTO[]> {
    return await this.channelService.fetchPosts(params.username)
  }

  @Get(':username/reels')
  async fetchReels(@Param() params: GetUserParamsDto): Promise<ChannelReelDTO[]> {
    return await this.channelService.fetchReels(params.username);
  }
  //#endregion
} 
