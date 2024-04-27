import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity'; // Assuming you have a Channel entity defined
import { ChannelPostImage } from './channel-post-image.entity';

@Entity('channel_post')
export class ChannelPost {
    @PrimaryColumn({ length: 200 })
    code: string;

    @Column({ length: 10000, nullable: true })
    caption_text?: string;

    @Column({ type: 'int', nullable: true })
    channel_post_numerical_order?: number;

    @Column({ type: 'int', nullable: true })
    carousel_media_count?: number;

    @Column({ type: 'int', nullable: true })
    original_height?: number;

    @Column({ type: 'int', nullable: true })
    original_width?: number;

    @Column({ type: 'int', nullable: true })
    video_height?: number;

    @Column({ type: 'int', nullable: true })
    video_width?: number;

    @Column({ length: 1000, nullable: true })
    video_url?: string;

    @Column({ type: 'int', nullable: true })
    video_type?: number;

    @Column({ type: 'int', nullable: true })
    comment_count?: number;

    @Column({ length: 200, nullable: true })
    product_type?: string;

    @ManyToOne(() => Channel, channel => channel.posts)
    @JoinColumn({ name: 'channel_username' })
    channel?: Channel;

    @OneToMany(() => ChannelPostImage, image => image.post)
    images?: ChannelPostImage[];
}