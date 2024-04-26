import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Priority } from './priority.entity';
import { KeywordChannel } from './keyword-channel.entity';
import { Hashtag } from './hashtag.entity';

@Entity()
export class Keyword {
    @PrimaryColumn({ length: 200 })
    name: string;

    @Column({ length: 50, default: 'MEDIUM' })
    priority: string;

    @ManyToOne(() => Priority)
    @JoinColumn({ name: 'priority' })
    priorityObj: Priority;

    @OneToMany(() => KeywordChannel, keywordChannel => keywordChannel.keyword, {
        cascade: ['insert', 'remove', 'soft-remove']
    })
    channels: KeywordChannel[];

    @OneToMany(() => Hashtag, hashtag => hashtag.keyword, {
        cascade: ['insert']
    })
    hashtags: Hashtag[];

}