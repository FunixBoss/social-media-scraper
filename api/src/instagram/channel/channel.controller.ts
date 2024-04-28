import { Controller, Get, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { IsEmpty, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsValidScraperInfo } from '../pipe/is-valid-scraper-info.validation';
import type { Response } from 'express';
import FindAllChannelDTO from './dto/findall-channel.dto';
import ChannelPostDTO from './dto/channel-post.dto';
import ChannelFriendshipDTO from './dto/channel-friendship.dto';
import ChannelReelDTO from './dto/channel-reel.dto';
import FindOneChannelDTO from './dto/findone-channel.dto';
import { ChannelExportService, ReadStreamDTO } from './channel-export.service';
import { ChannelDownloadService } from './channel-download.service';

export type ScrapeInfo = 'all' | 'profile' | 'friendships' | 'posts' | 'reels'
class GetUserScrapeInfosDto {
  @IsNotEmpty()
  @IsValidScraperInfo()
  infos: ScrapeInfo[];
}

export class GetExportTypeDto {
  @IsIn(["excel", "json"])
  type: string;
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

  @Get('')
  async fetchAll(@Query() queries: GetChannelsParamsDto): Promise<FindAllChannelDTO[]> {
    return await this.channelService.findAll(queries);
  }

  @Get('export')
  async exportChannels(@Res({ passthrough: true }) res: Response, @Query() queries: GetExportTypeDto): Promise<StreamableFile> {
    const file: ReadStreamDTO = await this.channelExportService.exportChannels(queries.type);
    if (queries.type == 'excel') {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      });
    } else {
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      });
    }
    return new StreamableFile(file.readStream);
  }

  @Get('export/:username')
  async exportChannel(
    @Res({ passthrough: true }) res: Response,
    @Param() params: GetUserParamsDto,
    @Query() queries: GetExportTypeDto): Promise<StreamableFile> {
    const file: ReadStreamDTO = await this.channelExportService.exportChannel(params.username, queries.type);
    if (queries.type == 'excel') {
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      });
    } else {
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      });
    }
    return new StreamableFile(file.readStream);
  }

  @Get(':username')
  async fetchUser(@Param() params: GetUserParamsDto, @Query() queries: GetUserScrapeInfosDto): Promise<FindOneChannelDTO> {
    return await this.channelService.fetchUser(params.username, queries.infos);
  }

  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUserParamsDto): Promise<FindAllChannelDTO> {
    try {
      return await this.channelService.fetchUserProfile(params.username);
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':username/friendships')
  async fetchFriendships(@Param() params: GetUserParamsDto): Promise<ChannelFriendshipDTO[]> {
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

  @Get('download/:username/reels')
  async downloadReels(@Param() params: GetUserParamsDto): Promise<any[]> {
    return await this.channelDownloadService.downloadReels(params.username);
  }
} 
