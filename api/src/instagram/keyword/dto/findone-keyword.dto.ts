import { Channel } from "src/instagram/entity/channel.entity";
import { Hashtag } from "src/instagram/entity/hashtag.entity";

export interface FindOneKeywordDTO {
    name?: string;
    priority?: string;
    total_channels?: number;
    total_hashtags?: number;
    channels?: Channel[]
    hashtags?: Hashtag[]
}