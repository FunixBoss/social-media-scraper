import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import axios from 'axios';
import ChannelReelDTO from '../dto/channel-reel.dto';
import { createWriteStream, promises } from 'fs';
import ChannelPostDTO from '../dto/channel-post.dto';
import { ChannelDownloadHistory } from '../../entity/channel-download-history.entity';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import ChannelHelper from './channel-helper.service';
import { ChannelService } from './channel.service';
import { DownloadConfig } from 'src/config/download-settings.type';
import { DownloadType } from '../dto/download-type.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { setTimeout } from 'timers/promises';

const pipelineAsync = promisify(pipeline);


@Injectable()
export class ChannelDownloadService {
    readonly logger = new Logger(ChannelDownloadService.name);

    private readonly DOWNLOAD_PATH: string;
    private readonly DOWNLOAD_CONFIG: DownloadConfig;
    constructor(
        private readonly configService: ConfigService,
        private readonly channelHelper: ChannelHelper,
        @InjectQueue('ins-download-queue') private readonly downloadQueue: Queue,
        @Inject(forwardRef(() => ChannelService)) private readonly channelService: ChannelService,
        @InjectRepository(ChannelDownloadHistory, 'instagram-scraper') private readonly channelDownloadRepository: Repository<ChannelDownloadHistory>,
    ) {
        this.DOWNLOAD_PATH = this.configService.get<string>("DOWNLOAD_PATH")
        this.DOWNLOAD_CONFIG = this.configService.get<DownloadConfig>("download")
    }

    async queueDownload(username: string, download: DownloadType): Promise<void> {
        try {
            console.log('Queueing download for:', username);
            await this.downloadQueue.add('download', { username, download }, {
                delay: 100,
                lifo: true,
                attempts: 1,
                removeOnComplete: true,
                removeOnFail: true,
            });
            console.log('Successfully queued download for:', username);
        } catch (error) {
            console.error('Error queueing download:', error);
        }
    }

    async download(username: string, download: DownloadType) {
        if (!(await this.channelHelper.isExists(username))) throw new EntityNotExists('Channel', username);

        try {
            if (!download) return;
            if (download.posts) {
                const { all, from_order, to_order } = download.posts;
                await this.downloadByOptions(username, { type: 'posts', all, from_order, to_order })
            }
            if (download.reels) {
                const { all, from_order, to_order } = download.reels;
                await this.downloadByOptions(username, { type: 'reels', all, from_order, to_order })
            }
        } catch (error) {
            this.logger.error('Download process encountered an error', error);
        }
    }

    private async downloadByOptions(username: string, options: {
        type: 'posts' | 'reels',
        all: boolean,
        from_order: number,
        to_order: number
    } = { type: 'posts', all: false, from_order: 1, to_order: 50 }): Promise<void> {
        const BASE_NAME = `${username}/${options.type}`
        let downloadPath: string = `${this.DOWNLOAD_PATH}/${BASE_NAME}`;
        await this.createAndAccessFolder(downloadPath);

        if (options.type == "posts") {
            if (options.all) {
                options.from_order = 1;
                options.to_order = await this.channelHelper.totalPosts(username)
            }
            await this.downloadPosts(username, downloadPath, options.from_order, options.to_order);
        } else if (options.type == "reels") {
            if (options.all) {
                options.from_order = 1;
                options.to_order = await this.channelHelper.totalReels(username)
            }
            await this.downloadReels(username, downloadPath, options.from_order, options.to_order)
        };

        let channelDownload: ChannelDownloadHistory = {
            channel_username: username,
            date: new Date(),
            file_name: `${BASE_NAME}`,
            from_order: options.from_order,
            to_order: options.to_order,
            download_directory: downloadPath,
            download_type: options.type,
        }
        await this.channelDownloadRepository.save(channelDownload)
        this.logger.log(`${username} - Downloaded all ${options.type} successfully - Folder: ${downloadPath}`);
    }

    private async downloadReels(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        const reels: ChannelReelDTO[] = await this.channelService.fetchReels(username);
        const filteredReels: ChannelReelDTO[] = reels.filter(reel =>
            reel.channel_reel_numerical_order >= from_order && reel.channel_reel_numerical_order <= to_order
        );

        if (filteredReels.length === 0) {
            this.logger.warn("No reels found within the specified range.");
            return;
        }

        const downloadReel = async (reel: ChannelReelDTO, downloadPath: string): Promise<void> => {
            await this.downloadVideo(reel.channel_reel_numerical_order, reel.code, reel.video_url, downloadPath);
            this.logger.log(`Downloaded reel successfully ${++downloaded}/${totalReels}`);
        };

        await this.createAndAccessFolder(downloadPath);

        let downloaded = 0;
        const totalReels = filteredReels.length;
        const batchSize = 50;
        for (let i = 0; i < filteredReels.length; i += batchSize) {
            const batch = filteredReels.slice(i, i + batchSize);
            await Promise.all(batch.map((reel) => downloadReel(reel, downloadPath)));
        }

        this.logger.log(`Downloaded all reels successfully: ${username}`);
    }

    private async downloadPosts(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        const posts: ChannelPostDTO[] = await this.channelService.fetchPosts(username);
        to_order = Math.min(to_order, posts.length);
        const filteredPosts: ChannelPostDTO[] = posts.filter(post =>
            post.channel_post_numerical_order >= from_order && post.channel_post_numerical_order <= to_order
        );

        if (filteredPosts.length === 0) {
            this.logger.log("No posts found within the specified range.");
            return;
        }

        const downloadPost = async (post: ChannelPostDTO, downloadPath: string): Promise<void> => {
            if (post.product_type === "feed" || post.product_type === "carousel_container") {
                await this.downloadImages(post, downloadPath);
            } else if (post.product_type === "clips" || post.product_type === "igtv") {
                await this.downloadVideo(post.channel_post_numerical_order, post.code, post.video_url, downloadPath);
            }
            this.logger.log(`Downloaded post successfully ${++downloaded}/${totalPosts}`);
        };

        await this.createAndAccessFolder(downloadPath);

        let downloaded = 0;
        const totalPosts = filteredPosts.length;
        const batchSize = 100;
        for (let i = 0; i < filteredPosts.length; i += batchSize) {
            const batch = filteredPosts.slice(i, i + batchSize);
            await Promise.all(batch.map((post) => downloadPost(post, downloadPath)));
        }
        this.logger.log(`Downloaded all posts successfully: ${username}`);
    }

    private async downloadImages(post: ChannelPostDTO, downloadPath: string): Promise<void> {
        if (!post.image_urls || post.image_urls.length === 0) return;

        const imagePromises = post.image_urls.map(async (url, index) => {
            const fileSuffix = post.product_type === "carousel_container" ? `.${index + 1}` : "";
            const imagePath = `${downloadPath}/${post.channel_post_numerical_order}${fileSuffix}-${post.code}.jpg`;

            try {
                await promises.access(imagePath);
                this.logger.verbose(`Image already exists: ${imagePath}`);
            } catch {
                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 7000 });
                    await promises.writeFile(imagePath, response.data);
                    this.logger.verbose(`Downloaded image: ${imagePath} successfully`);
                } catch (error) {
                    this.logger.warn(`Error downloading image at ${imagePath}`, error);
                }
            }
        });

        await Promise.all(imagePromises);
    }

    async downloadVideo(order: number, code: string, video_url: string, downloadPath: string): Promise<void> {
        const videoName = `${order}-${code}.mp4`;
        const filePath = `${downloadPath}/${videoName}`;

        try {
            await promises.access(filePath);
            this.logger.verbose(`Video already exists: ${filePath}`);
        } catch {
            try {
                const response = await axios(video_url, { method: 'GET', responseType: 'stream', timeout: 15000 });
                const writer = createWriteStream(filePath);

                const downloadPromise = pipelineAsync(response.data, writer);

                // 50 video/batch & 15s for 1 video
                const timeoutPromise = setTimeout(50 * 15000)
                    .then(() => {
                        this.logger.warn(`Download timed out for video at ${filePath}`);
                        writer.close();
                        throw new Error('Download timeout');
                    });

                await Promise.race([downloadPromise, timeoutPromise]);
                this.logger.verbose(`Downloaded video: ${filePath} successfully`);
            } catch (error) {
                this.logger.warn(`Error downloading video at ${filePath}`, error);
            }
        }
    }

    async createAndAccessFolder(path: string): Promise<void> {
        try {
            await promises.mkdir(path, { recursive: true });
            this.logger.verbose(`Directory created at ${path}`);
        } catch (error) {
            this.logger.verbose(`Error creating directory at ${path}:`, error);
            throw error; // Rethrow to handle it in the calling 
        }
    }

    async folderExists(path: string): Promise<boolean> {
        try {
            await promises.access(path, promises.constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }
}

