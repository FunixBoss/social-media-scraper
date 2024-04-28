import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelReel } from '../entity/channel-reel.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import axios from 'axios';
import ChannelReelDTO from './dto/channel-reel.dto';
import { ChannelService } from './channel.service';
import { createWriteStream, promises } from 'fs';

@Injectable()
export class ChannelDownloadService {
    constructor(
        private readonly channelService: ChannelService,
        private readonly dataSource: DataSource,
        @InjectRepository(ChannelReel) private readonly channelReelRepository: Repository<ChannelReel>,
    ) { }


    async downloadReels(username: string): Promise<any[]> {
        if (!(await this.channelService.isExists(username))) throw new EntityNotExists('Channel', username);
        let reels: ChannelReelDTO[] = [];
        if (await this.channelService.isCrawledContent(username, "CHANNEL_REELS")) {
            reels = await this.channelService.mapToChannelReelDTOs(await this.channelReelRepository.find({
                where: { channel: { username } }
            }))
        } else {
            reels = await this.channelService.fetchReels(username)
        }
        let reelsLen = reels.length;
        if (reelsLen == 0) return [];

        const DOWNLOAD_PATH = `downloads/instagram/channel/${username}`
        await createAndAccessFolder(DOWNLOAD_PATH);
        const downloadPromises = reels.map(reel => this.downloadVideo(reel, DOWNLOAD_PATH));
        return await Promise.all(downloadPromises);
    }

    async downloadVideo(reel: ChannelReelDTO, downloadPath: string): Promise<string> {
        const { video_url, channel_reel_numerical_order, code } = reel;
        const videoName = `${channel_reel_numerical_order}-${code}.mp4`;
        const filePath = `${downloadPath}/${videoName}`;
        console.log(`Downloading: ${videoName}`)
        try {
            const response = await axios(video_url, { method: 'GET', responseType: 'stream' });
            const writer = createWriteStream(filePath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));
                writer.on('error', (err) => {
                    console.error(`Error writing file at ${filePath}:`, err);
                    writer.close();
                    reject(err);
                });
            });
        } catch (error) {
            console.error(`Error downloading video from ${video_url} to ${filePath}:`, error["name"]);
            throw error;
        }
    }

}

async function createAndAccessFolder(path: string): Promise<void> {
    try {
        await promises.mkdir(path, { recursive: true });
        console.log(`Directory created at ${path}`);
    } catch (error) {
        console.error(`Error creating directory at ${path}:`, error);
        throw error; // Rethrow to handle it in the calling function
    }
}