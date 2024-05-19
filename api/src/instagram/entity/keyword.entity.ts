import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { KeywordChannel } from './keyword-channel.entity';
import { Hashtag } from './hashtag.entity';

@Entity()
export class Keyword {
    @PrimaryColumn({ length: 200 })
    name?: string;

    @Column({ length: 50, default: 'MEDIUM' })
    priority?: string;

    @OneToMany(() => KeywordChannel, keywordChannel => keywordChannel.keyword, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    keyword_channels?: KeywordChannel[];

    @OneToMany(() => Hashtag, hashtag => hashtag.keyword, {
        cascade: true,
        onDelete: 'CASCADE'
    })
    hashtags?: Hashtag[];
}