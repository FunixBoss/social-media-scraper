import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Keyword } from './keyword.entity';
import { Channel } from './channel.entity';

@Entity()
export class KeywordChannel {
    @PrimaryColumn()
    keyword_name: number;

    @PrimaryColumn({ length: 200 })
    channel_username: string;

    @Column({ length: 50 })
    status: string;

    @ManyToOne(() => Keyword, keyword => keyword.channels)
    @JoinColumn({ name: 'keyword_name' })
    keyword: Keyword;

    @ManyToOne(() => Channel, channel => channel.keywords)
    @JoinColumn({ name: 'channel_username' })
    channel: Channel;
}