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
        @InjectRepository(ChannelDownloadHistory) private readonly channelDownloadRepository: Repository<ChannelDownloadHistory>,
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

    async downloadReels(username: string, downloadPath: string, from_order: number, to_order: number): Promise<any[]> {
        let reels: ChannelReelDTO[] = await this.channelService.fetchReels(username)
        let filteredReels: ChannelReelDTO[] = reels.filter(reel => reel.channel_reel_numerical_order >= from_order &&
            reel.channel_reel_numerical_order <= to_order)
        if (reels.length == 0) return [];

        await createAndAccessFolder(downloadPath);
        const downloadPromises = filteredReels.map(reel => this.downloadReel(reel, downloadPath));
        return Promise.all(downloadPromises);
    }

    private async downloadReel(reel: ChannelReelDTO, downloadPath: string): Promise<string> {
        const { video_url, channel_reel_numerical_order, code } = reel;
        const videoName = `${channel_reel_numerical_order}-${code}.mp4`;
        const filePath = `${downloadPath}/${videoName}`;
        try {
            const response = await axios(video_url, { method: 'GET', responseType: 'stream' });
            const writer = createWriteStream(filePath);
            response.data.pipe(writer);
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`Downloaded video: ${videoName} successfully`);
                    resolve(filePath)
                });
                writer.on('error', (err) => {
                    console.error(`Error downloading video at ${filePath}:`, `Error: ${err["name"]} - ${err["message"]}`);
                    writer.close();
                    reject(err);
                });
            });
        } catch (error) {
            console.error(`Error downloading video ${reel.channel_reel_numerical_order}-${reel.code} to ${filePath}:`, `Error: ${error["name"]} - ${error["message"]}`);
        }
    }

    async downloadPosts(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        let posts: ChannelPostDTO[] = await this.channelService.fetchPosts(username);
        to_order = (to_order > posts.length) ? posts.length : to_order;

        let filteredPosts: ChannelPostDTO[] = posts.filter(post => post.channel_post_numerical_order >= from_order &&
            post.channel_post_numerical_order <= to_order)

        if (filteredPosts.length === 0) return;

        await createAndAccessFolder(downloadPath);
        const downloadPromises = [];
        for (const [index, post] of filteredPosts.entries()) {
            downloadPromises.push(this.downloadPost(post, downloadPath))
        }
        await Promise.all(downloadPromises);
    }

    async downloadPost(post: ChannelPostDTO, downloadPath: string): Promise<any> {
        switch (post.product_type) {
            case "feed": {
                const imagePath = `${downloadPath}/${post.channel_post_numerical_order}-${post.code}.jpg`;
                if (post.image_urls && post.image_urls.length > 0) {
                    const response = await axios.get(post.image_urls[0], { responseType: 'arraybuffer' });
                    await promises.writeFile(imagePath, response.data);
                    console.log(`Downloaded image: ${imagePath} successfully`);
                } else if (post.video_url) {
                    const videoName = `${post.channel_post_numerical_order}-${post.code}.mp4`;
                    const filePath = `${downloadPath}/${videoName}`;
                    const response = await axios(post.video_url, { method: 'GET', responseType: 'stream' });
                    const writer = createWriteStream(filePath);
                    response.data.pipe(writer);
                    return new Promise((resolve, reject) => {
                        writer.on('finish', () => {
                            console.log(`Downloaded video: ${videoName} successfully`);
                            resolve(filePath)
                        });
                        writer.on('error', (err) => {
                            console.error(`Error downloading video at ${filePath}:`, `Error: ${err["name"]} - ${err["message"]}`);
                            writer.close();
                            reject(err);
                        });
                    });
                }
                break;
            };
            case "carousel_container": {
                if (post.image_urls && post.image_urls.length > 0) {
                    for (const [index, image_url] of post.image_urls.entries()) {
                        const imagePath = `${downloadPath}/${post.channel_post_numerical_order}.${index + 1}-${post.code}.jpg`;
                        const response = await axios.get(image_url, { responseType: 'arraybuffer' });
                        await promises.writeFile(imagePath, response.data);
                        console.log(`Downloaded image: ${imagePath} successfully`);
                    }
                }
                break;
            }
            case "clips": {
                const videoName = `${post.channel_post_numerical_order}-${post.code}.mp4`;
                const filePath = `${downloadPath}/${videoName}`;
                const response = await axios(post.video_url, { method: 'GET', responseType: 'stream' });
                const writer = createWriteStream(filePath);
                response.data.pipe(writer);
                return new Promise((resolve, reject) => {
                    writer.on('finish', () => {
                        console.log(`Downloaded video: ${videoName} successfully`);
                        resolve(filePath)
                    });
                    writer.on('error', (err) => {
                        console.error(`Error downloading video at ${filePath}:`, `Error: ${err["name"]} - ${err["message"]}`);
                        writer.close();
                        reject(err);
                    });
                });
                break;
            }
            case "igtv": {
                const videoName = `${post.channel_post_numerical_order}-${post.code}.mp4`;
                const filePath = `${downloadPath}/${videoName}`;
                const response = await axios(post.video_url, { method: 'GET', responseType: 'stream' });
                const writer = createWriteStream(filePath);
                response.data.pipe(writer);
                return new Promise((resolve, reject) => {
                    writer.on('finish', () => {
                        console.log(`Downloaded video: ${videoName} successfully`);
                        resolve(filePath)
                    });
                    writer.on('error', (err) => {
                        console.error(`Error downloading video at ${filePath}:`, `Error: ${err["name"]} - ${err["message"]}`);
                        writer.close();
                        reject(err);
                    });
                });
                break;
            }
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

async function folderExists(path: string): Promise<boolean> {
    try {
        await promises.access(path, promises.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}