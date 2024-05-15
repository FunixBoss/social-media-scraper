import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import axios from 'axios';
import ChannelReelDTO from '../dto/channel-reel.dto';
import { ChannelService } from './channel.service';
import { createWriteStream, promises } from 'fs';
import ChannelPostDTO from '../dto/channel-post.dto';
import { ChannelDownloadHistory } from '../../entity/channel-download-history.entity';
import { ChannelDownloadHistoryDTO } from '../dto/channel-download-history.dto';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { format } from 'date-fns';

@Injectable()
export class ChannelDownloadService {
    private readonly DOWNLOAD_PATH: string;
    private readonly logger = new Logger(ChannelDownloadService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly channelService: ChannelService,
        @InjectRepository(ChannelDownloadHistory, 'instagram-scraper') private readonly channelDownloadRepository: Repository<ChannelDownloadHistory>,
    ) {
        this.DOWNLOAD_PATH = this.configService.get<string>("DOWNLOAD_PATH")
    }

    async findAllDownloadHistories(username: string): Promise<ChannelDownloadHistoryDTO[]> {
        const downloadHistories = await this.channelDownloadRepository.find({ where: { channel_username: username } })
        return downloadHistories.map(d => {
            const { id, download_type, from_order, to_order, date } = d;
            return { id, download_type, from_order, to_order, date }
        })
    }

    async downloadById(username: string, id: number): Promise<void> {
        const downloadHistory = await this.channelDownloadRepository.findOne({ where: { id } })
        if (!downloadHistory) throw new EntityNotExists('ChannelDownloadHistory', `username: ${username} - id: ${id}`);
        if (!(await folderExists(downloadHistory.download_directory))) throw new Error(`${downloadHistory.download_directory} is not found`)
    }

    async download(username: string, type: string, from_order: number, to_order: number): Promise<void> {
        if (!(await this.channelService.isExists(username))) throw new EntityNotExists('Channel', username);
        const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
        const BASE_NAME = `${username}-${type}-${from_order}_${to_order}-${currentDate}`
        let downloadPath: string = `${this.DOWNLOAD_PATH}/${BASE_NAME}`;

        if (type == "posts") await this.downloadPosts(username, downloadPath, from_order, to_order);
        else if (type == "reels") await this.downloadReels(username, downloadPath, from_order, to_order);

        let channelDownload: ChannelDownloadHistory = {
            channel_username: username,
            date: new Date(),
            file_name: `${BASE_NAME}`,
            from_order,
            to_order,
            download_directory: downloadPath,
            download_type: type,
        }
        await this.channelDownloadRepository.save(channelDownload)
        this.logger.log(`Downloaded all ${type} successfully - Folder: ${downloadPath}`);
    }

    async downloadReels(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        const reels: ChannelReelDTO[] = await this.channelService.fetchReels(username);
        const filteredReels: ChannelReelDTO[] = reels.filter(reel =>
            reel.channel_reel_numerical_order >= from_order && reel.channel_reel_numerical_order <= to_order
        );

        if (filteredReels.length === 0) {
            console.log("No reels found within the specified range.");
            return;
        }

        await createAndAccessFolder(downloadPath);
        const batches = this.createBatches(filteredReels, 10);

        for (const batch of batches) {
            const downloadPromises = batch.map(reel => this.downloadReel(reel, downloadPath));
            await Promise.all(downloadPromises);
            this.logger.log("Downloaded a batch of reels successfully")
        }
    }

   
    private async downloadReel(reel: ChannelReelDTO, downloadPath: string): Promise<void> {
        const videoName = `${reel.channel_reel_numerical_order}-${reel.code}.mp4`;
        const filePath = `${downloadPath}/${videoName}`;

        try {
            const response = await axios({
                url: reel.video_url,
                method: 'GET',
                responseType: 'stream',
            });

            const writer = createWriteStream(filePath);
            const streamPromise = new Promise<void>((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`Downloaded video: ${videoName} successfully`);
                    resolve();
                });

                writer.on('error', err => {
                    console.error(`Error downloading video at ${filePath}:`, `Error: ${err.name} - ${err.message}`);
                    writer.close();
                    reject(err);
                });
            });

            response.data.pipe(writer);
            await streamPromise;
        } catch (error) {
            console.error(`Error downloading video ${reel.channel_reel_numerical_order}-${reel.code} to ${filePath}:`, `Error: ${error.name} - ${error.message}`);
        }
    }

    async downloadPosts(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        const posts: ChannelPostDTO[] = await this.channelService.fetchPosts(username);
        to_order = Math.min(to_order, posts.length);

        const filteredPosts: ChannelPostDTO[] = posts.filter(post =>
            post.channel_post_numerical_order >= from_order && post.channel_post_numerical_order <= to_order
        );

        if (filteredPosts.length === 0) {
            this.logger.log("No posts found within the specified range.");
            return;
        }

        await createAndAccessFolder(downloadPath);
        const batches = this.createBatches(filteredPosts, 10);

        for (const batch of batches) {
            const downloadPromises = batch.map(post => this.downloadPost(post, downloadPath));
            await Promise.all(downloadPromises);
            this.logger.log("Downloaded a batch of posts successfully");
        }
        this.logger.log('All batches completed');
    }

    async downloadPost(post: ChannelPostDTO, downloadPath: string): Promise<void[]> {
        const tasks = [];
        if (post.product_type === "feed" || post.product_type === "carousel_container") {
            tasks.push(this.downloadImages(post, downloadPath));
        } else if (post.product_type === "clips" || post.product_type === "igtv") {
            tasks.push(this.downloadVideo(post, downloadPath));
        }
        return Promise.all(tasks);
    }

    async downloadImages(post: ChannelPostDTO, downloadPath: string): Promise<void> {
        if (!post.image_urls || post.image_urls.length === 0) return;

        const imagePromises = post.image_urls.map(async (url, index) => {
            const fileSuffix = post.product_type === "carousel_container" ? `.${index + 1}` : "";
            const imagePath = `${downloadPath}/${post.channel_post_numerical_order}${fileSuffix}-${post.code}.jpg`;
            try {
                const response = await axios.get(url, { responseType: 'arraybuffer' });
                await promises.writeFile(imagePath, response.data);
                console.log(`Downloaded image: ${imagePath} successfully`);
            } catch (error) {
                this.logger.warn(`Error downloading image at ${imagePath}`, error);
            }
        });

        await Promise.all(imagePromises);
    }

    async downloadVideo(post: ChannelPostDTO, downloadPath: string): Promise<void> {
        const videoName = `${post.channel_post_numerical_order}-${post.code}.mp4`;
        const filePath = `${downloadPath}/${videoName}`;
        try {
            const response = await axios(post.video_url, { method: 'GET', responseType: 'stream' });
            const writer = createWriteStream(filePath);
            response.data.pipe(writer);
            return new Promise<void>((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`Downloaded video: ${videoName} successfully`);
                    resolve();
                });
                writer.on('error', err => {
                    this.logger.warn(`Error downloading video at ${filePath}`, err);
                    writer.close();
                    reject(err);
                });
            });
        } catch (error) {
            this.logger.warn(`Error downloading video at ${filePath}`, error);
        }
    }

    private createBatches(data: any[], batchSize: number): any[][] {
        const batches: any[][] = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
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

async function folderExists(path: string): Promise<boolean> {
    try {
        await promises.access(path, promises.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}