import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Priority } from './priority.entity';
import { ChannelReel } from './channel-reel.entity';
import { Keyword } from './keyword.entity';

@Entity()
export class Hashtag {
    @PrimaryColumn({ length: 200 })
    code: string;

    @Column({nullable: true})
    media_count?: number;
    
    @Column({ length: 50, nullable: true})
    category?: string;

    @Column({ length: 50 })
    classify?: string;


    @Column({ length: 50, default: 'MEDIUM' })
    priority?: string;

    // Define the relationship with the Priority entity
    @ManyToOne(() => Priority)
    @JoinColumn({ name: 'priority' })
    priorityEntity?: Priority;

    // @ManyToOne(() => ChannelReel, channelReel => channelReel.hashtags, {
    //     cascade: false
    // })
    // channelReels?: ChannelReel[];

    @ManyToOne(() => Keyword, keyword => keyword.hashtags)
    @JoinColumn({ name: 'keyword_name' })
    keyword?: Keyword;
}
