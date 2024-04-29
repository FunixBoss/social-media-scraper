import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Keyword } from './keyword.entity';

@Entity()
export class Hashtag {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ length: 200 })
    code?: string;

    @Column({ nullable: true })
    media_count?: number;

    @Column({ length: 200, nullable: true })
    category?: string;

    @Column({ type: 'bool', nullable: true, default: false })
    is_self_adding?: boolean;

    @Column({ type: 'bool', nullable: true, default: false })
    is_bot_scanning?: boolean;

    @Column({ length: 50, default: 'MEDIUM' })
    priority?: string;

    // @ManyToOne(() => ChannelReel, channelReel => channelReel.hashtags, {
    //     cascade: false
    // })
    // channelReels?: ChannelReel[];

    @ManyToOne(() => Keyword, keyword => keyword.hashtags, {
        eager: true
    })
    @JoinColumn({ name: 'keyword_name' })
    keyword?: Keyword;
}
