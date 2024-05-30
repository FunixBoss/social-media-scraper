import FindAllChannelDTO from "src/instagram/channel/dto/findall-channel.dto";
import FindAllHashtagDTO from "src/instagram/hashtag/dto/findall-hashtag.dto";

export default interface FindOneKeywordDTO {
    name?: string;
    priority?: string;
    total_channels?: number;
    total_hashtags?: number;
    channels?: FindAllChannelDTO[]
    hashtags?: FindAllHashtagDTO[]
}