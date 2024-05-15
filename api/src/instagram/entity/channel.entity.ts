import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ChannelCrawlingHistory } from './channel-crawling-history.entity';
import { ChannelFriendship } from './channel-friendship.entity';
import { ChannelReel } from './channel-reel.entity';
import { KeywordChannel } from './keyword-channel.entity';
import { ChannelPost } from './channel-post.entity';

@Entity('channel')
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

    @Column({ type: 'int', nullable: true })
    media_count?: number;

    @Column({ length: 200, nullable: true })
    id?: string;

    @Column({ length: 200, nullable: true })
    pk?: string;

    @Column({ length: 50, nullable: true, default: 'MEDIUM' })
    priority?: string;

    @Column({ type: 'bool', nullable: true, default: false })
    is_self_adding?: boolean;

    @Column({ type: 'bool', name: "is_bot_scanning", nullable: true, default: false })
    is_bot_scanning?: boolean; 

    @OneToMany(() => ChannelCrawlingHistory, (history) => history.channel, {
        eager: true,
        onDelete: 'CASCADE'
    })
    crawlingHistory?: ChannelCrawlingHistory[];

    @OneToMany(() => ChannelFriendship, friendship => friendship.channel)
    friendships?: ChannelFriendship[];

    @OneToMany(() => ChannelPost, reel => reel.channel, {
        lazy: true
    })
    posts?: ChannelPost[];

    @OneToMany(() => ChannelReel, reel => reel.channel, {
        lazy: true
    })
    reels?: ChannelReel[];

    @OneToMany(() => KeywordChannel, keywordChannel => keywordChannel.channel, {
        lazy: true
    })
    keywords?: KeywordChannel[];
}