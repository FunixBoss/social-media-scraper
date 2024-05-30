import { Body, Controller, Param, Post } from '@nestjs/common';
import { ChannelDownloadService } from './service/channel-download.service';
import { GetUsernameParamsDTO } from './dto/get-username-params.dto';
import { DownloadType } from './dto/download-type.dto';

@Controller('ins/channel/download')
export class ChannelController {

  constructor(
    private readonly channelDownloadService: ChannelDownloadService,
  ) { }

  @Post(':username')
  async download(@Param() params: GetUsernameParamsDTO, @Body() body: DownloadType): Promise<{ message: string }> {
    this.channelDownloadService.queueDownload(params.username, body);
    return { message: "Download has been queued" };
  }
}
