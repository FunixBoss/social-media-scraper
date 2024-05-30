import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Keyword } from './keyword.entity';
import { Channel } from './channel.entity';

@Entity()
export class KeywordChannel {
    @PrimaryColumn({ length: 200 })
    keyword_name: string;

    @PrimaryColumn({ length: 200 })
    channel_username: string;

    @Column({ length: 200, nullable: true })
    status: string;

    @ManyToOne(() => Keyword, keyword => keyword.keyword_channels, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'keyword_name' })
    keyword?: Keyword;

    @ManyToOne(() => Channel, channel => channel.keywords)
    @JoinColumn({ name: 'channel_username' })
    channel?: Channel;
}