import { Entity, Column, PrimaryColumn, OneToMany, OneToOne } from 'typeorm';
import { ChannelCrawlingHistory } from './channel-crawling-history.entity';
import { ChannelProfile } from './channel-profile.entity';
import { ChannelFriendship } from './channel-friendship.entity';
import { ChannelReel } from './channel-reel.entity';
import { KeywordChannel } from './keyword-channel.entity';

@Entity()
export class Channel {
    @PrimaryColumn({ length: 200 })
    username: string;

    @Column({ length: 200, nullable: true })
    category: string;

    @OneToMany(() => ChannelCrawlingHistory, (history) => history.channel)
    crawlingHistory: ChannelCrawlingHistory[];

    @OneToOne(() => ChannelProfile, profile => profile.channel)
    profile: ChannelProfile;

    @OneToMany(() => ChannelFriendship, friendship => friendship.channel)
    friendships: ChannelFriendship[];

    @OneToMany(() => ChannelReel, reel => reel.channel)
    reels: ChannelReel[];

    @OneToMany(() => KeywordChannel, keywordChannel => keywordChannel.channel)
    keywords: KeywordChannel[];
}