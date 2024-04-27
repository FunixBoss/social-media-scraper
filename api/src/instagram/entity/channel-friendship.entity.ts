import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelFriendship {
    @PrimaryColumn({ length: 200 })
    username?: string;

    @Column({ length: 200, nullable: true })
    friendship_status?: string;

    @Column({ length: 200, nullable: true })
    full_name?: string;

    @Column({ length: 200, nullable: true })
    pk?: string;

    @Column({ length: 1000, nullable: true })
    profile_pic_url?: string;

    @Column({ length: 200, nullable: true })
    supervision_info?: string;

    @Column({ length: 200, nullable: true })
    social_context?: string;

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'channel_username' })
    channel?: Channel;
}