import { ChannelDownloadHistoryDTO } from './dto/channel-download-history.dto';
import { Controller, Get, Param, Post, Query, Res, UsePipes } from '@nestjs/common';
import { ChannelService } from './service/channel.service';
import type { Response } from 'express';
import FindAllChannelDTO from './dto/findall-channel.dto';
import ChannelPostDTO from './dto/channel-post.dto';
import ChannelReelDTO from './dto/channel-reel.dto';
import FindOneChannelDTO from './dto/findone-channel.dto';
import { ChannelExportService } from './service/channel-export.service';
import { ChannelDownloadService } from './service/channel-download.service';
import { ParseCommaSeparatedQuery } from 'src/pipes/parse-comma-separate-query.pipe';
import { GetUsernameParamsDTO } from './dto/get-username-params.dto';
import { GetUserNIdParamsDTO } from './dto/get-user-and-id-params.dto';
import { GetDownloadTypeDTO } from './dto/get-download-type.dto';
import { GetExportTypeDTO } from './dto/get-export-type.dto';
import { GetUserScrapeInfosDTO } from './dto/get-user-scrape-info.dto';
import { GetChannelsQueryDTO } from './dto/get-channels-query.dto';

// export type ScrapeInfo = 'all' | 'profile' | 'friendships' | 'posts' | 'reels'

@Controller('ins/channel')
export class ChannelController {

  constructor(
    private readonly channelService: ChannelService,
    private readonly channelExportService: ChannelExportService,
    private readonly channelDownloadService: ChannelDownloadService,
  ) { }
  
  //#region Download
  @Get('download/:username/findall')
  async findAllDownloads(@Param() params: GetUsernameParamsDTO): Promise<ChannelDownloadHistoryDTO[]> {
    return await this.channelDownloadService.findAllDownloadHistories(params.username);
  }

  @Get('download/:username/:id')
  async downloadReelsWithId(@Param() params: GetUserNIdParamsDTO): Promise<{ message: string }> {
    this.channelDownloadService.downloadById(params.username, params.id);
    return { message: "Downloading" };
  }

  @Get('download/:username')
  async download(@Param() params: GetUsernameParamsDTO, @Query() queries: GetDownloadTypeDTO): Promise<{ message: string }>{
    this.channelDownloadService.download(params.username, queries);
    return { message: "Downloading" };
  }
  //#endregion

  //#region export
  @Get('export')
  async exportChannels(@Res({ passthrough: true }) res: Response, @Query() queries: GetExportTypeDTO): Promise<{ message: string }> {
    this.channelExportService.exportChannels(queries.type);
    return { message: "Exporting" };
  }

  @Get('export/:username')
  async exportChannel(
    @Res({ passthrough: true }) res: Response,
    @Param() params: GetUsernameParamsDTO,
    @Query() queries: GetExportTypeDTO): Promise<{ message: string }> {
    this.channelExportService.exportChannel(params.username, queries.type);
    return { message: "Exporting" };
  }
  //#endregion

  //#region Fetch
  @Get('')
  async fetchAll(@Query() queries: GetChannelsQueryDTO): Promise<FindAllChannelDTO[]> {
    return await this.channelService.findAll(queries);
  }

  @Post(':username')
  async fetchUser(@Param() params: GetUsernameParamsDTO, @Query() queries: GetUserScrapeInfosDTO): Promise<FindOneChannelDTO> {
    return await this.channelService.fetchUser(params.username, true, queries);
  }

  @Get('scrape/profile')
  @UsePipes(ParseCommaSeparatedQuery)
  getUsersByUsernames(@Query('usernames') usernames: string[]): Promise<FindAllChannelDTO[]> {
    return this.channelService.fetchUserProfiles(usernames);
  }

  @Get(":username/exists")
  async isChannelExist(@Param() params: GetUsernameParamsDTO): Promise<boolean> {
    try {
      await this.channelService.fetchUserProfile(params.username);
      return true;
    } catch (error) {
      return false
    }
  }

  @Get(':username/profile')
  async fetchProfile(@Param() params: GetUsernameParamsDTO): Promise<FindAllChannelDTO> {
    return this.channelService.fetchUserProfile(params.username);
  }

  @Get(':username/friendships')
  async fetchFriendships(@Param() params: GetUsernameParamsDTO): Promise<FindAllChannelDTO[]> {
    return await this.channelService.fetchFriendships(params.username);
  }

  @Get(':username/posts')
  async fetchPosts(@Param() params: GetUsernameParamsDTO): Promise<ChannelPostDTO[]> {
    return await this.channelService.fetchPosts(params.username)
  }

  @Get(':username/reels')
  async fetchReels(@Param() params: GetUsernameParamsDTO): Promise<ChannelReelDTO[]> {
    return await this.channelService.fetchReels(params.username);
  }
  //#endregion
} 
