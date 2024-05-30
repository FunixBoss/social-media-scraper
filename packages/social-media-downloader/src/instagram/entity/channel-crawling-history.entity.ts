import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { CrawlingType } from './crawling-type.entity';

@Entity()
export class ChannelCrawlingHistory {
    @PrimaryColumn({ length: 200 })
    channel_username: string;

    @PrimaryColumn({ length: 200 })
    crawling_type_name: string;

    @ManyToOne(() => Channel, { cascade: true })
    @JoinColumn({ name: 'channel_username' })
    channel?: Channel;

    @ManyToOne(() => CrawlingType, { cascade: true, eager: true })
    @JoinColumn({ name: 'crawling_type_name' })
    crawlingType?: CrawlingType; 

    @Column({ nullable: true })
    date: Date;
} 