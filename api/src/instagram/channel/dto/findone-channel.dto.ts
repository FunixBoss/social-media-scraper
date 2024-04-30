import ChannelReelDTO from "./channel-reel.dto";
import ChannelPostDTO from "./channel-post.dto";
import ChannelFriendshipDTO from "./channel-friendship.dto";

export default interface FindOneChannelDTO {
    username?: string;
    url?: string;
    category?: string;
    biography?: string;
    bio_link_url?: string;
    external_url?: string;
    follower_count?: number;
    following_count?: number;
    full_name?: string;
    hd_profile_pic_url_info?: string;
    profile_pic_url?: string;
    id?: string;
    total_posts: number;
    total_reels: number;
    total_friendships: number;
    pk?: string;
    priority?: string;
    is_self_adding?: boolean;
    is_bot_scanning?: boolean;
    crawled: string[];
    friendships?: ChannelFriendshipDTO[];
    posts?: ChannelPostDTO[];
    reels?: ChannelReelDTO[];
}