// channel-crawling-history.entity.ts

import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { CrawlingType } from './crawling-type.entity';

@Entity()
export class ChannelCrawlingHistory {
    @PrimaryColumn({ length: 200 })
    channel_username: string;

    @PrimaryColumn({ length: 50 })
    crawling_type: string;

    @ManyToOne(() => Channel, { cascade: true })
    @JoinColumn({ name: 'channel_username' })
    channel: Channel;

    @ManyToOne(() => CrawlingType, { cascade: true })
    @JoinColumn({ name: 'crawling_type_name' })
    crawlingType: CrawlingType;

    @Column()
    date: Date;
}