import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ChannelDownloadHistory } from '../../entity/channel-download-history.entity';
import { ChannelDownloadHistoryDTO } from '../dto/channel-download-history.dto';
import { DownloadType } from '../dto/get-user-scrape-info.dto';
import { SOCIAL_MEDIA_DOWNLOADER_API } from 'src/pptr/config/social-media.config';
@Injectable() 
export class ChannelDownloadService {
    private readonly logger = new Logger(ChannelDownloadService.name)

    constructor(@InjectRepository(ChannelDownloadHistory, 'instagram-scraper') private readonly channelDownloadRepository: Repository<ChannelDownloadHistory>) { }

    async findAllDownloadHistories(username: string): Promise<ChannelDownloadHistoryDTO[]> {
        const downloadHistories = await this.channelDownloadRepository.find({ where: { channel_username: username } })
        return downloadHistories.map(d => {
            const { id, download_type, from_order, to_order, date } = d;
            return { id, download_type, from_order, to_order, date }
        })
    }

    async download(username: string, options: DownloadType): Promise<void> {
        axios.post(`${SOCIAL_MEDIA_DOWNLOADER_API}/ins/channel/download/${username}`, options)
            .then((response) => {
                if (response.status == 200) {
                    this.logger.log(`Downloading`, response.data)
                }
            })
            .catch(error => {
                this.logger.warn("Download error", error)
            })
    }

}
