import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelPost } from './channel-post.entity';

@Entity('channel_post_image')
export class ChannelPostImage {
    @PrimaryGeneratedColumn()
    image_id?: number;

    @Column({ type: 'int' })
    image_height?: number;

    @Column({ type: 'int' })
    image_width?: number;

    @Column({ length: 1000 })
    image_url?: string;

    @ManyToOne(() => ChannelPost, post => post.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'channel_post_code' })
    post?: ChannelPost;
}
