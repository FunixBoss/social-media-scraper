import { Channel } from "src/instagram/entity/channel.entity";
import { InsHighlights } from "./InsHighlights";
import { ChannelFriendship } from "src/instagram/entity/channel-friendship.entity";
import { ChannelReel } from "src/instagram/entity/channel-reel.entity";
import { ChannelPost } from "src/instagram/entity/channel-post.entity";

export default interface InsUser {
    profile?: Channel;
    friendshipUsers?: ChannelFriendship[];
    posts?: ChannelPost[];
    reels?: ChannelReel[];
}