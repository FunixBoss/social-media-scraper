import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelReel } from '../entity/channel-reel.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import axios from 'axios';
import ChannelReelDTO from './dto/channel-reel.dto';
import { ChannelService } from './channel.service';
import { access, createReadStream, createWriteStream, promises, readdirSync, writeFile, writeFileSync } from 'fs';
import { ChannelPost } from '../entity/channel-post.entity';
import ChannelPostDTO from './dto/channel-post.dto';
import * as archiver from 'archiver';
import { ReadStreamDTO } from './channel-export.service';

@Injectable()
export class ChannelDownloadService {
    constructor(
        private readonly channelService: ChannelService,
        private readonly dataSource: DataSource,
        @InjectRepository(ChannelReel) private readonly channelReelRepository: Repository<ChannelReel>,
        @InjectRepository(ChannelPost) private readonly channelPostRepository: Repository<ChannelPost>,
    ) { }

    async download(username: string, type?: string): Promise<ReadStreamDTO> {
        if (!(await this.channelService.isExists(username))) throw new EntityNotExists('Channel', username);
        const DOWNLOAD_BASE_PATH = `downloads/instagram/channel/${username}`;
        let downloadPath: string;
        let outputFileName: string;
        let outputPath: string;
        let downloadPromises = [];
        if (type) {
            if (type == "posts") {
                if (!(await folderExists(`${DOWNLOAD_BASE_PATH}/posts`))) {
                    if (countFilesInDirectorySync(`${DOWNLOAD_BASE_PATH}/posts`) == 0) {
                        (await this.downloadPosts(username, DOWNLOAD_BASE_PATH)).forEach(post => downloadPromises.push(post))
                    }
                }
                downloadPath = `${DOWNLOAD_BASE_PATH}/posts`
                outputFileName = `${username}-posts.zip`
            }
            if (type == "reels") {
                if (!(await folderExists(`${DOWNLOAD_BASE_PATH}/reels`))) {
                    if (countFilesInDirectorySync(`${DOWNLOAD_BASE_PATH}/reels`) == 0) {
                        (await this.downloadReels(username, DOWNLOAD_BASE_PATH)).forEach(reel => downloadPromises.push(reel))
                    }
                }
                downloadPath = `${DOWNLOAD_BASE_PATH}/reels`
                outputFileName = `${username}-reels.zip`
            }
        } else {
            if (!(await folderExists(`${DOWNLOAD_BASE_PATH}/reels`))) {
                await createAndAccessFolder(`${DOWNLOAD_BASE_PATH}/reels`);
                downloadPromises.push(this.downloadReels(username, DOWNLOAD_BASE_PATH))
            }
            if (!(await folderExists(`${DOWNLOAD_BASE_PATH}/posts`))) {
                await createAndAccessFolder(`${DOWNLOAD_BASE_PATH}/posts`);
                downloadPromises.push(this.downloadPosts(username, DOWNLOAD_BASE_PATH))
            }
            downloadPath = `${DOWNLOAD_BASE_PATH}`
            outputFileName = `${username}-full.zip`
        } 
        outputPath = `${DOWNLOAD_BASE_PATH}-${type || 'full'}.zip`
        console.log(`downloadPath: ${downloadPath} - outputPath: ${outputPath}`);

        if (!(await folderExists(outputPath))) {
            await Promise.all(downloadPromises);
            await this.createZipFile(downloadPath, outputPath);
        }
        return {
            readStream: createReadStream(outputPath),
            fileName: outputFileName
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

    async downloadReels(username: string, baseDownloadPath: string): Promise<any[]> {
        let reels: ChannelReelDTO[] = await this.channelService.fetchReels(username)
        let reelsLen = reels.length;
        if (reelsLen == 0) return [];

        const DOWNLOAD_PATH = `${baseDownloadPath}/reels`
        await createAndAccessFolder(DOWNLOAD_PATH);
        const downloadPromises = reels.map(reel => this.downloadVideo(reel, DOWNLOAD_PATH));
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

    async downloadPosts(username: string, baseDownloadPath: string): Promise<any[]> {
        if (!(await this.channelService.isExists(username))) throw new EntityNotExists('Channel', username);
        let posts: ChannelPostDTO[] = await this.channelService.fetchPosts(username);
        if (posts.length === 0) return [];

        const DOWNLOAD_PATH = `${baseDownloadPath}/posts`;
        await createAndAccessFolder(DOWNLOAD_PATH);

        const downloadPromises = [];

        for (const post of posts) {
            if (post.image_urls && post.image_urls.length > 0) {
                for (const [index, imageUrl] of post.image_urls.entries()) {
                    const imagePath = `${DOWNLOAD_PATH}/${post.channel_post_numerical_order}.${index + 1}-${post.code}.jpg`;
                    downloadPromises.push(this.downloadImage(imageUrl, imagePath).then(() => {
                        console.log("Downloaded Image: " + imagePath);
                    }));
                }
            }
        }

        return Promise.all(downloadPromises);
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

function countFilesInDirectorySync(path: string): number {
    try {
        const files = readdirSync(path);
        return files.length;  // This counts all entries, including directories
    } catch (error) {
        console.error('Error reading directory:');
        return 0;
    }
}