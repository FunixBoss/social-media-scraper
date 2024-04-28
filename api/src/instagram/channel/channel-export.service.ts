import { Injectable } from '@nestjs/common';
import { InjectPage } from 'nestjs-puppeteer';
import { Page } from 'puppeteer';
import { Channel } from '../entity/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Workbook } from 'exceljs'
import { format } from 'date-fns';
import { createReadStream, ReadStream, writeFileSync } from 'fs';
import { join } from 'path';
import { ChannelService } from './channel.service';
import { TCrawlingType } from '../entity/crawling-type.entity';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import FindAllChannelDTO from './dto/findall-channel.dto';
import ChannelFriendshipDTO from './dto/channel-friendship.dto';
import ChannelPostDTO from './dto/channel-post.dto';
import ChannelReelDTO from './dto/channel-reel.dto';
import FindOneChannelDTO from './dto/findone-channel.dto';

export type ReadStreamDTO = {
  readStream: ReadStream;
  fileName: string;
}
@Injectable()
export class ChannelExportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly channelService: ChannelService,
    @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
    @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
  ) {
  }

  async exportChannels(exportType: string | "json" | "excel"): Promise<ReadStreamDTO> {
    if (exportType == 'excel') return await this.exportChannelsExcel();
    if (exportType == 'json') return await this.exportChannelsJson();
  }


  private async exportChannelsExcel(): Promise<ReadStreamDTO> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Channels');

    // Define headers
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Follower Count', key: 'follower_count', width: 15 },
      { header: 'Following Count', key: 'following_count', width: 15 },
      { header: 'Total Posts', key: 'total_posts', width: 12 },
      { header: 'Total Reels', key: 'total_reels', width: 12 },
      { header: 'Total Friendships', key: 'total_friendships', width: 17 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Biography', key: 'biography', width: 100 },
      { header: 'Bio Link URL', key: 'bio_link_url', width: 30 },
      { header: 'External URL', key: 'external_url', width: 30 },
      { header: 'Profile Pic URL', key: 'profile_pic_url', width: 30 },
      { header: 'Is Bot Scanning', key: 'is_bot_scanning', width: 15 },
    ];

    // Add rows using the mock data
    (await this.channelRepository.find()).forEach((channel) => {
      worksheet.addRow(channel);
    });

    // Write to file
    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channels'
    const fileName = `channels-${currentDate}.xlsx`
    await workbook.xlsx.writeFile(`${downloadPath}/${fileName}`);
    console.log('Excel file was written successfully.');
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }



  private async exportChannelsJson(): Promise<ReadStreamDTO> {
    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channels'
    const fileName = `channels-${currentDate}.json`
    writeFileSync(`${downloadPath}/${fileName}`, JSON.stringify(await this.channelRepository.find()), 'utf-8')
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }

  async exportChannel(username: string, exportType: string | "json" | "excel"): Promise<ReadStreamDTO> {
    if (!(await this.channelService.isExists(username))) throw new EntityNotExists("Channel", username);
    const crawledTypes: TCrawlingType[] = await this.channelService.getCrawledHistory(username)
    if (!crawledTypes.includes("CHANNEL_PROFILE")) throw new Error("Please crawl as least the channel profile");

    if (exportType == 'excel') return await this.exportChannelExcel(username, crawledTypes);
    if (exportType == 'json') return await this.exportChannelJson(username, crawledTypes);
  }



  private async exportChannelJson(username: string, crawledTypes: TCrawlingType[]): Promise<ReadStreamDTO> {
    let channel: FindAllChannelDTO;
    let friendships: ChannelFriendshipDTO[];
    let posts: ChannelPostDTO[];
    let reels: ChannelReelDTO[];
    if (crawledTypes.includes("CHANNEL_PROFILE"))
      channel = await this.channelService.findOne(username);
    if (crawledTypes.includes("CHANNEL_FRIENDSHIP"))
      friendships = await this.channelService.fetchFriendships(username);
    if (crawledTypes.includes("CHANNEL_POSTS"))
      posts = await this.channelService.fetchPosts(username);
    if (crawledTypes.includes("CHANNEL_REELS"))
      reels = await this.channelService.fetchPosts(username);
    const channelFull: FindOneChannelDTO = await this.channelService.mapToFindOneChannelDTOfromOrigin(channel, friendships, posts, reels);
 
    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channel'
    const fileName = `${username}-${currentDate}.json`
    writeFileSync(`${downloadPath}/${fileName}`, JSON.stringify(channelFull), 'utf-8')
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }

  private async exportChannelExcel(username: string, crawledTypes: TCrawlingType[]): Promise<ReadStreamDTO> {
    const workbook = new Workbook();
    if (crawledTypes.includes("CHANNEL_PROFILE"))
      createAndWriteProfileWorkSheet(workbook, await this.channelService.findOne(username));
    if (crawledTypes.includes("CHANNEL_FRIENDSHIP"))
      createAndWriteFriendshipsWorkSheet(workbook, await this.channelService.fetchFriendships(username));
    if (crawledTypes.includes("CHANNEL_POSTS"))
      createAndWritePostsWorkSheet(workbook, await this.channelService.fetchPosts(username));
    if (crawledTypes.includes("CHANNEL_REELS"))
      createAndWriteReelsWorkSheet(workbook, await this.channelService.fetchPosts(username));

    const currentDate = format(new Date(), 'dd_MM_yyyy_hh_mm_ss');
    const downloadPath = 'downloads/instagram/channel'
    const fileName = `${username}-${currentDate}.xlsx`
    await workbook.xlsx.writeFile(`${downloadPath}/${fileName}`);
    console.log(`Excel file ${fileName} was written successfully.`);
    return {
      readStream: createReadStream(join(process.cwd(), `${downloadPath}/${fileName}`)),
      fileName
    }
  }
}

async function createAndWriteProfileWorkSheet(workbook: Workbook, channel: FindAllChannelDTO): Promise<void> {
  let worksheet = workbook.addWorksheet(`Profile`)
  worksheet.columns = [
    { header: 'Profile Pic URL', key: 'profile_pic_url', width: 30 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Full Name', key: 'full_name', width: 25 },
    { header: 'Url', key: 'url', width: 25 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Follower Count', key: 'follower_count', width: 15 },
    { header: 'Following Count', key: 'following_count', width: 15 },
    { header: 'Total Posts', key: 'total_posts', width: 12 },
    { header: 'Total Reels', key: 'total_reels', width: 12 },
    { header: 'Total Friendships', key: 'total_friendships', width: 17 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Biography', key: 'biography', width: 100 },
    { header: 'Bio Link URL', key: 'bio_link_url', width: 30 },
    { header: 'External URL', key: 'external_url', width: 30 },
    { header: 'Is Bot Scanning', key: 'is_bot_scanning', width: 15 },
    { header: 'Is Self Adding', key: 'is_self_adding', width: 15 },
  ];

  worksheet.addRow(channel);

}

async function createAndWriteFriendshipsWorkSheet(workbook: Workbook, friendships: ChannelFriendshipDTO[]): Promise<void> {
  let worksheet = workbook.addWorksheet(`Friendships`)
  worksheet.columns = [
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Full Name', key: 'full_name', width: 25 },
    { header: 'Url', key: 'url', width: 25 },
  ];

  friendships.forEach(f => worksheet.addRow(f))
}

async function createAndWritePostsWorkSheet(workbook: Workbook, posts: ChannelPostDTO[]): Promise<void> {
  let worksheet = workbook.addWorksheet(`Posts`)
  worksheet.columns = [
    { header: 'Order', key: 'channel_post_numerical_order', width: 20 },
    { header: 'Code', key: 'code', width: 30 },
    { header: 'Url', key: 'url', width: 25 },
    { header: 'Like Count', key: 'like_count', width: 12 },
    { header: 'Comment Count', key: 'comment_count', width: 12 },
    { header: 'Number Of Carousel Images', key: 'carousel_media_count', width: 15 },
    { header: 'Images', key: 'image_urls', width: 15 },
    { header: 'Video Url', key: 'video_url', width: 12 },
    { header: 'Video Type', key: 'video_type', width: 12 },
    { header: 'Product type', key: 'product_type', width: 17 },
    { header: 'Caption', key: 'caption_text', width: 25 },
  ];
  posts
    .map(p => {
      return {
        ...p,
        image_urls: p.image_urls.join("\n")
      }
    })
    .forEach(p => worksheet.addRow(p))
}

async function createAndWriteReelsWorkSheet(workbook: Workbook, reels: ChannelReelDTO[]): Promise<void> {
  let worksheet = workbook.addWorksheet(`Reels`)
  worksheet.columns = [
    { header: 'Order', key: 'channel_post_numerical_order', width: 20 },
    { header: 'Code', key: 'code', width: 20 },
    { header: 'Url', key: 'url', width: 25 },
    { header: 'Likes', key: 'like_count', width: 15 },
    { header: 'Comment Count', key: 'comment_count', width: 12 },
    { header: 'Image Url', key: 'image_url', width: 25 },
    { header: 'Play Count', key: 'play_count', width: 12 },
    { header: 'Video Url', key: 'video_url', width: 12 },
    { header: 'Video Type', key: 'video_type', width: 12 },
    { header: 'Media Type', key: 'media_type', width: 100 },

  ];
  reels.forEach(r => worksheet.addRow(r))
}