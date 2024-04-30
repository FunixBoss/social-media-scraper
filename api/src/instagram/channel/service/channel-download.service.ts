import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import axios from 'axios';
import ChannelReelDTO from '../dto/channel-reel.dto';
import { ChannelService } from './channel.service';
import { createReadStream, createWriteStream, promises, readdirSync } from 'fs';
import ChannelPostDTO from '../dto/channel-post.dto';
import * as archiver from 'archiver';
import { ReadStreamDTO } from './channel-export.service';
import { ChannelDownloadHistory } from '../../entity/channel-download-history.entity';
import { ChannelDownloadHistoryDTO } from '../dto/channel-download-history.dto';

@Injectable()
export class ChannelDownloadService {
    constructor(
        private readonly channelService: ChannelService,
        private readonly dataSource: DataSource,
        @InjectRepository(ChannelDownloadHistory) private readonly channelDownloadRepository: Repository<ChannelDownloadHistory>,
    ) { }

    async findAllDownloadHistories(username: string): Promise<ChannelDownloadHistoryDTO[]> {
        const downloadHistories = await this.channelDownloadRepository.find({ where: { channel_username: username } })
        return downloadHistories.map(d => {
            const { id, download_type, from_order, to_order, date } = d;
            return { id, download_type, from_order, to_order, date }
        })
    }

    async downloadById(username: string, id: number): Promise<ReadStreamDTO> {
        const downloadHistory = await this.channelDownloadRepository.findOne({ where: { id } })
        if (!downloadHistory) throw new EntityNotExists('ChannelDownloadHistory', `username: ${username} - id: ${id}`);
        if (!(await folderExists(downloadHistory.download_directory))) throw new Error(`${downloadHistory.download_directory} is not found`)
        return {
            readStream: createReadStream(downloadHistory.download_directory),
            fileName: downloadHistory.file_name
        }
    }

    async download(username: string, type: string, from_order: number, to_order: number): Promise<ReadStreamDTO> {
        if (!(await this.channelService.isExists(username))) throw new EntityNotExists('Channel', username);
        const DOWNLOAD_BASE_PATH = `downloads/instagram/channel`;
        const BASE_NAME = `${username}-${type}-${from_order}_${to_order}`
        let downloadPath: string = `${DOWNLOAD_BASE_PATH}/${BASE_NAME}`;
        let outputPath: string = `${downloadPath}.zip`;

        if (type == "posts") await this.downloadPosts(username, downloadPath, from_order, to_order);
        else if (type == "reels") await this.downloadReels(username, downloadPath, from_order, to_order);

        await this.createZipFile(downloadPath, outputPath);
        let channelDownload: ChannelDownloadHistory = {
            channel_username: username,
            date: new Date(),
            file_name: `${BASE_NAME}.zip`,
            from_order,
            to_order,
            download_directory: outputPath,
            download_type: type,
        }
        await this.channelDownloadRepository.save(channelDownload)
        return {
            readStream: createReadStream(outputPath),
            fileName: `${username}-${type}.zip`
        }
    }

    private async createZipFile(sourceDir: string, outPath: string): Promise<void> {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const output = createWriteStream(outPath);

        return new Promise((resolve, reject) => {
            archive
                .directory(sourceDir, false)
                .on('error', err => reject(err))
                .pipe(output);

            output.on('close', () => resolve());
            archive.finalize();
        });
    }

    async downloadReels(username: string, downloadPath: string, from_order: number, to_order: number): Promise<any[]> {
        let reels: ChannelReelDTO[] = await this.channelService.fetchReels(username)
        let filteredReels: ChannelReelDTO[] = reels.filter(reel => reel.channel_reel_numerical_order >= from_order &&
            reel.channel_reel_numerical_order <= to_order)
        if (reels.length == 0) return [];

        await createAndAccessFolder(downloadPath);
        const downloadPromises = filteredReels.map(reel => this.downloadVideo(reel, downloadPath));
        return Promise.all(downloadPromises);
    }

    private async downloadVideo(reel: ChannelReelDTO, downloadPath: string): Promise<string> {
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
            console.error(`Error downloading video ${reel.channel_reel_numerical_order}-${reel.code} to ${filePath}:`, error);
        }
    }

    async downloadPosts(username: string, downloadPath: string, from_order: number, to_order: number): Promise<void> {
        let posts: ChannelPostDTO[] = await this.channelService.fetchPosts(username);
        let filteredPosts: ChannelPostDTO[] = posts.filter(post => post.channel_post_numerical_order >= from_order &&
            post.channel_post_numerical_order <= to_order)

        if (filteredPosts.length === 0) return;

        await createAndAccessFolder(downloadPath);
        const downloadPromises = [];
        for (const post of filteredPosts) {
            if (post.image_urls && post.image_urls.length > 0) {
                console.log("run");
                
                for (const [index, imageUrl] of post.image_urls.entries()) {
                    const imagePath = `${downloadPath}/${post.channel_post_numerical_order}.${index + 1}-${post.code}.jpg`;
                    downloadPromises.push(
                        this.downloadImage(imageUrl, imagePath).then(() => {
                            console.log("Downloaded Image: " + imagePath);
                        }));
                }
            }
        }
        await Promise.all(downloadPromises);
        console.log("Downloaded All Successfully");
    }

    async downloadImage(url: string, filePath: string): Promise<void> {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await promises.writeFile(filePath, response.data);
    }

    async zipDirectory(sourceDir: string, outPath: string): Promise<string> {
        const archive = archiver('zip', { zlib: { level: 9 } }); // Sets the compression level.
        const stream = createWriteStream(outPath);

        return new Promise((resolve, reject) => {
            archive
                .directory(sourceDir, false) // The second parameter controls whether to include the directory itself in the archive
                .on('error', err => reject(err))
                .pipe(stream);

            stream.on('close', () => resolve(outPath));
            archive.finalize();
        });
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