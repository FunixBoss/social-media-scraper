import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ChannelReel } from './channel-reel.entity';
import { Hashtag } from './hashtag.entity';

@Entity()
export class ChannelReelHashtag {
    @PrimaryColumn({ length: 200 })
    channel_reel_code: string;

    @PrimaryColumn({ length: 200 })
    hashtag_code: string;

    @ManyToOne(() => ChannelReel, channelReel => channelReel.hashtags)
    @JoinColumn({ name: 'channel_reel_code' })
    channelReel: ChannelReel;

    // @ManyToOne(() => Hashtag, hashtag => hashtag.channelReels)
    // @JoinColumn({ name: 'hashtag_code' })
    // hashtag: Hashtag;
}