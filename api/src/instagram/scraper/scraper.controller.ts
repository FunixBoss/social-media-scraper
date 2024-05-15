import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import ScraperService from './service/scraper.service';
import { GetUserParamsDto } from '../channel/channel.controller';
import { Channel } from '../entity/channel.entity';
import { ParseCommaSeparatedQuery } from 'src/pipes/parse-comma-separate-query.pipe';

@Controller('scraper')
export class ScraperController {

  constructor(private readonly scraperService: ScraperService) {
  }

  @Get(':username/profile')
  async user(@Param() params: GetUserParamsDto): Promise<Channel> {
    return this.scraperService.scrapeUserProfile(params.username);
  }

  @Get('profiles')
  @UsePipes(ParseCommaSeparatedQuery)
  getUsersByUsernames(@Query('usernames') usernames: string[]): Promise<Channel[]> {
    return this.scraperService.scrapeUserProfiles(usernames);
  }

}
