import FindAllChannelDTO from "../channel/findall-channel.dto";
import FindAllHashtagDTO from "../hashtag/findall-hashtag.dto";

export default interface FindOneKeywordDTO {
    name?: string;
    priority?: string;
    total_channels?: number;
    total_hashtags?: number;
    channels?: FindAllChannelDTO[]
    hashtags?: FindAllHashtagDTO[]
}