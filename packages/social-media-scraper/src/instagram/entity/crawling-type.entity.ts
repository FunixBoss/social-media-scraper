import { Entity, Column, PrimaryColumn } from 'typeorm';

export type TCrawlingType = 
"CHANNEL_PROFILE" 
| "CHANNEL_FRIENDSHIP" 
| "CHANNEL_POSTS"
| "CHANNEL_REELS"
| "EXPLORE_HASHTAG"
| "EXPORE_KEYWORD"
@Entity()
export class CrawlingType {
    @PrimaryColumn({ length: 200 })
    name: string;
}