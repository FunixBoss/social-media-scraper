import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelFriendship } from '../../entity/channel-friendship.entity';
import { ChannelReel } from '../../entity/channel-reel.entity';
import { ChannelPost } from '../../entity/channel-post.entity';
import ChannelPostDTO from '../dto/channel-post.dto';
import ChannelReelDTO from '../dto/channel-reel.dto';

@Injectable()
export default class ChannelMapperService {
    private readonly baseUrl = 'https://instagram.com'

    constructor(
        @InjectRepository(ChannelFriendship, 'instagram-scraper') private readonly channelFriendRepository: Repository<ChannelFriendship>,
        @InjectRepository(ChannelReel, 'instagram-scraper') private readonly channelReelRepository: Repository<ChannelReel>,
        @InjectRepository(ChannelPost, 'instagram-scraper') private readonly channelPostRepository: Repository<ChannelPost>,
    ) {
    }

    async mapToChannelPostDTOs(posts: ChannelPost[]): Promise<ChannelPostDTO[]> {
        return posts.map(post => {
            const { code, caption_text, like_count, channel_post_numerical_order, carousel_media_count, video_url, video_type, comment_count, product_type } = post
            const image_urls: string[] = post.images.map(img => img.image_url)
            return {
                code,
                url: `${this.baseUrl}/p/${post.code}/`,
                caption_text,
                channel_post_numerical_order,
                carousel_media_count,
                image_urls,
                video_url,
                video_type,
                like_count,
                comment_count,
                product_type
            }
        })
    }

    async mapToChannelReelDTOs(reels: ChannelReel[]): Promise<ChannelReelDTO[]> {
        return reels.map(reel => {
            const { code, channel_reel_numerical_order, comment_count, image_url, like_count, media_type, play_count, product_type, video_url } = reel
            return {
                code,
                url: `${this.baseUrl}/reel/${reel.code}/`,
                channel_reel_numerical_order,
                comment_count,
                image_url,
                like_count,
                media_type,
                play_count,
                product_type,
                video_url,
                channel_username: reel.channel?.username
            }
        })
    }

    private async getTotalPost(username: string): Promise<number> {
        return this.channelPostRepository.count({ where: { channel: { username } } })
    }

    private async getTotalReel(username: string): Promise<number> {
        return this.channelReelRepository.count({ where: { channel: { username } } })
    }

    private async getTotalFriendship(username: string): Promise<number> {
        return this.channelFriendRepository.count({ where: { channel: { username } } })
    }
}