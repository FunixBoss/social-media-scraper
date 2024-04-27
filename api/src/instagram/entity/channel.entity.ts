import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ChannelCrawlingHistory } from './channel-crawling-history.entity';
import { ChannelFriendship } from './channel-friendship.entity';
import { ChannelReel } from './channel-reel.entity';
import { KeywordChannel } from './keyword-channel.entity';
import { ChannelPost } from './channel-post.entity';

@Entity()
export class Channel {
    @PrimaryColumn({ length: 200 })
    username?: string;

    @Column({ length: 200, nullable: true })
    category?: string;

    @Column({ length: 2000, nullable: true })
    biography?: string;

    @Column({ length: 1000, nullable: true })
    bio_link_url?: string;

    @Column({ length: 1000, nullable: true })
    external_url?: string;

    @Column({ type: 'int', nullable: true })
    follower_count?: number;

    @Column({ type: 'int', nullable: true })
    following_count?: number;

    @Column({ length: 1000, nullable: true })
    full_name?: string;

    @Column({ length: 1000, nullable: true })
    hd_profile_pic_url_info?: string;

    @Column({ length: 1000, nullable: true })
    profile_pic_url?: string;

    @Column({ length: 200, nullable: true })
    id?: string;

    @Column({ type: 'int', nullable: true })
    total_posts?: number;

    @Column({ type: 'int', nullable: true })
    total_reels?: number;

    @Column({ type: 'int', nullable: true })
    total_friendships?: number;

    @Column({ length: 200, nullable: true })
    pk?: string;

    @Column({ length: 50, default: 'MEDIUM' })
    priority?: string;

    @Column({ type: 'enum', enum: ["SELF_ADDING", "BOT_SCANNING"], nullable: true })
    classify?: 'SELF_ADDING' | 'BOT_SCANNING' | null;

    @OneToMany(() => ChannelCrawlingHistory, (history) => history.channel)
    crawlingHistory?: ChannelCrawlingHistory[];

    @OneToMany(() => ChannelFriendship, friendship => friendship.channel)
    friendships?: ChannelFriendship[];

    @OneToMany(() => ChannelPost, reel => reel.channel)
    posts?: ChannelPost[];

    @OneToMany(() => ChannelReel, reel => reel.channel)
    reels?: ChannelReel[];

    @OneToMany(() => KeywordChannel, keywordChannel => keywordChannel.channel)
    keywords?: KeywordChannel[];
}