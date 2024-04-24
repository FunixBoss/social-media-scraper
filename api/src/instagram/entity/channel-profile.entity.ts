import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelProfile {
    @PrimaryColumn({ length: 200 })
    username: string;

    @Column({ length: 200, nullable: true })
    bio_link_url: string;

    @Column({ length: 200, nullable: true })
    external_url: string;

    @Column({ type: 'int' })
    follower_count: number;

    @Column({ type: 'int' })
    following_count: number;

    @Column({ length: 200, nullable: true })
    full_name: string;

    @Column({ length: 200, nullable: true })
    hd_profile_pic_url_info: string;

    @Column({ length: 200 })
    id: string;

    @Column({ type: 'int' })
    media_count: number;

    @Column({ length: 200 })
    pk: string;

    @Column({ length: 200 })
    profile_pic_url: string;

    @OneToOne(() => Channel, (channel) => channel.profile)
    @JoinColumn({ name: 'username' })
    channel: Channel;
}