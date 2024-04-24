import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelFriendship {
    @PrimaryColumn({ length: 200 })
    username: string;

    @Column({ length: 50 })
    friendship_status: string;

    @Column({ length: 50 })
    full_name: string;

    @Column({ length: 50 })
    pk: string;

    @Column({ length: 50 })
    profile_pic_url: string;

    @Column({ length: 50 })
    supervision_info: string;

    @Column({ length: 50 })
    social_context: string;

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'channel_username' })
    channel: Channel;
}