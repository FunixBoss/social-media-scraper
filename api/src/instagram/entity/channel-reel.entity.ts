import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelReelHashtag } from './channel-reel-hashtag.entity';

@Entity()
export class ChannelReel {
    @PrimaryColumn({ length: 200 })
    code: string;

    @Column({ type: 'int', nullable: true })
    channel_reel_numerical_order?: number;

    @Column({ length: 200, nullable: true })
    audience?: string;

    @Column({ type: 'int', nullable: true })
    comment_count?: number;

    @Column({ length: 200, nullable: true })
    id?: string;

    @Column({ type: 'int', nullable: true })
    image_height?: number;

    @Column({ type: 'int', nullable: true })
    image_width?: number;

    @Column({ length: 1000, nullable: true })
    image_url?: string;

    @Column({ type: 'int', nullable: true })
    like_count?: number;

    @Column({ type: 'int', nullable: true })
    media_type?: number;

    @Column({ length: 200, nullable: true })
    pk?: string;

    @Column({ type: 'int', nullable: true })
    play_count?: number;

    @Column({ length: 200, nullable: true })
    product_type?: string;

    @Column({ length: 1000, nullable: true })
    video_url?: string;

    @ManyToOne(() => Channel, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'channel_username' })
    channel?: Channel;

    @OneToMany(() => ChannelReelHashtag, channelReelHashtag => channelReelHashtag.channelReel)
    hashtags?: ChannelReelHashtag[];
}