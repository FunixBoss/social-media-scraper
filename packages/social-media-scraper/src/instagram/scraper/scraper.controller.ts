import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import ScraperService, { ScrapeProfilesResult } from './service/scraper.service';
import { Channel } from '../entity/channel.entity';
import { ParseCommaSeparatedQuery } from 'src/pipes/parse-comma-separate-query.pipe';
import { GetUsernameParamsDTO } from '../channel/dto/get-username-params.dto';

@Controller('scraper')
export class ScraperController {

  constructor(private readonly scraperService: ScraperService) {
  }

  @Get('check-port')
  async checkRotatingProxyport(): Promise<any> {
    this.scraperService.checkPort();
  }

  @Get(':username/profile')
  async user(@Param() params: GetUsernameParamsDTO): Promise<Channel> {
    return this.scraperService.scrapeUserProfile(params.username);
  }

  @Get('profiles')
  getUsersByUsernames(@Query('usernames', ParseCommaSeparatedQuery) usernames: string[]): Promise<ScrapeProfilesResult> {
    return this.scraperService.scrapeUserProfiles(usernames);
  }

  @Get('test')
  test() {
    this.scraperService.test();
  }
}
