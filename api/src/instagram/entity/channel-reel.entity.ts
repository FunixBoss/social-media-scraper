import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelReelHashtag } from './channel-reel-hashtag.entity';

@Entity()
export class ChannelReel {
    @PrimaryColumn({ length: 200 })
    code: string;

    @Column({ type: 'int' })
    channel_reel_numerical_order: number;

    @Column({ length: 200, nullable: true })
    audience: string;

    @Column({ type: 'int' })
    comment_count: number;

    @Column({ length: 200 })
    id: string;

    @Column({ type: 'int' })
    image_height: number;

    @Column({ type: 'int' })
    image_width: number;

    @Column({ length: 200 })
    image_url: string;

    @Column({ type: 'int' })
    like_count: number;

    @Column({ type: 'int' })
    media_type: number;

    @Column({ length: 200 })
    pk: string;

    @Column({ type: 'int' })
    play_count: number;

    @Column({ length: 200, nullable: true })
    product_type: string;

    @Column({ length: 200, nullable: true })
    video_url: string;

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'channel_username' })
    channel: Channel;

    @OneToMany(() => ChannelReelHashtag, channelReelHashtag => channelReelHashtag.channelReel)
    hashtags: ChannelReelHashtag[];
}