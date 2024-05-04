import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChannelFriendship } from '../../entity/channel-friendship.entity';
import { ChannelReel } from '../../entity/channel-reel.entity';
import { CrawlingType } from '../../entity/crawling-type.entity';
import { ChannelCrawlingHistory } from '../../entity/channel-crawling-history.entity';
import { ChannelPost } from '../../entity/channel-post.entity';
import FindAllChannelDTO from '../dto/findall-channel.dto';
import ChannelPostDTO from '../dto/channel-post.dto';
import ChannelReelDTO from '../dto/channel-reel.dto';
import FindOneChannelDTO from '../dto/findone-channel.dto';
import { Channel } from "src/instagram/entity/channel.entity";
@Injectable()
export default class ChannelMapperService {
    private readonly baseUrl = 'https://instagram.com'

    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,
        @InjectRepository(ChannelFriendship) private readonly channelFriendRepository: Repository<ChannelFriendship>,
        @InjectRepository(ChannelReel) private readonly channelReelRepository: Repository<ChannelReel>,
        @InjectRepository(CrawlingType) private readonly crawlingTypeRepository: Repository<CrawlingType>,
        @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlRepository: Repository<ChannelCrawlingHistory>,
        @InjectRepository(ChannelPost) private readonly channelPostRepository: Repository<ChannelPost>,
        @InjectRepository(ChannelCrawlingHistory) private readonly channelCrawlingHistoryRepository: Repository<ChannelCrawlingHistory>,
    ) {
    }
    async findAllChannelsByRootFriendshipUsername(username: string): Promise<Channel[]> {
        const friendships = await this.channelFriendRepository.find({
            where: [
                { username: username },
                { channel_username: username }
            ],
            relations: ['channel', 'friendship_channels']
        });

        // Extract unique channels from the friendships
        const channelSet = new Set<Channel>();
        friendships.forEach(f => {
            if (f.channel && f.channel.username !== username) {
                channelSet.add(f.channel);
            }
            if (f.friendship_channels && f.friendship_channels.username !== username) {
                channelSet.add(f.friendship_channels);
            }
        });

        return Array.from(channelSet);
    }

    async mapToFindAllChannelDTO(channel: Channel): Promise<FindAllChannelDTO> {
        let crawled: string[] = channel.crawlingHistory.map(c => c.crawling_type_name)
        return {
            ...channel,
            media_count: +channel.media_count,
            total_posts: crawled.includes("CHANNEL_POSTS") ? await this.getTotalPost(channel.username) : undefined,
            total_reels: crawled.includes("CHANNEL_REELS") ? await this.getTotalReel(channel.username) : undefined,
            total_friendships: crawled.includes("CHANNEL_FRIENDSHIP") ? await this.getTotalFriendship(channel.username) : undefined,
            url: `${this.baseUrl}/${channel.username}`,
            crawlingHistory: undefined,
            crawled
        } as FindAllChannelDTO
    }

    async mapToFindAllChannelDTOs(channels: Channel[]): Promise<FindAllChannelDTO[]> {
        const promises = channels.map(channel => this.mapToFindAllChannelDTO(channel));
        return Promise.all(promises);
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

    async mapToFindOneChannelDTOfromOrigin(channel: FindAllChannelDTO, friendships?: FindAllChannelDTO[], posts?: ChannelPostDTO[], reels?: ChannelReelDTO[]): Promise<FindOneChannelDTO> {
        return {
            ...channel,
            friendships,
            posts,
            reels
        }
    }

    async mapToFindOneChannel(channel: Channel, friendships?: Channel[], posts?: ChannelPost[], reels?: ChannelReel[]): Promise<FindOneChannelDTO> {
        return {
            ...(await this.mapToFindAllChannelDTO(channel)),
            friendships: friendships
                ? await this.mapToFindAllChannelDTOs(await this.findAllChannelsByRootFriendshipUsername(channel.username))
                : [],
            posts: posts ? await this.mapToChannelPostDTOs(posts) : undefined,
            reels: reels ? await this.mapToChannelReelDTOs(reels) : undefined
        }
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