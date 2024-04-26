export type InsHashtags = {
    hashtags: InsHashtag[]
    len: number;
}

export type InsHashtag = {
    position?: number;
    name?: string;
    id?: number;
    media_count?: number;
}

export type InsSearchChannels = {
    channels: InsSearchChannel[];
    len: number;
}

export type InsSearchChannel = {
    username: string;
    full_name: string;
    unseen_count: number | null;
    profile_pic_url: string;
}

export type InsSearching = {
    xdt_api__v1__fbsearch__topsearch_connection: {
        hashtags?: InsHashtagFull[];
        inform_module?: any;
        places?: any[];
        rank_token?: string;
        see_more?: any;
        users?: {
            position: number;
            user: InsSearchChannelFull
        }[]
    }
}

export type InsHashtagFull = {
    position: number;
    hashtag: {
        name: string;
        media_count: number;
        id: number;
    };
}

export type InsSearchChannelFull = {
    username: string;
    is_verified: boolean;
    full_name: string;
    search_social_context: string;
    unseen_count: number | null;
    pk: string;
    live_broadcast_visibility: any; // Change the type accordingly if you know the type
    live_broadcast_id: any; // Change the type accordingly if you know the type
    profile_pic_url: string;
    hd_profile_pic_url_info: string; // Change the type accordingly if you know the type
    is_unpublished: boolean; // Change the type accordingly if you know the type
    id: string | number; // Change the type accordingly if you know the type
}

export function mapInsSearchChannel(channels: InsSearching): InsSearchChannel[] {
    const searchChannels: InsSearchChannel[] = [];

    if (!channels || !channels.xdt_api__v1__fbsearch__topsearch_connection || !channels.xdt_api__v1__fbsearch__topsearch_connection.users) {
        return searchChannels; // Return an empty array if there are no users
    }

    for (const user of channels.xdt_api__v1__fbsearch__topsearch_connection.users) {
        if (!user || !user.user) {
            continue; // Skip invalid entries
        }

        const { username, full_name, unseen_count, profile_pic_url } = user.user;

        const searchChannel: InsSearchChannel = {
            username,
            full_name,
            unseen_count,
            profile_pic_url,
        };

        searchChannels.push(searchChannel);
    }

    return searchChannels;
}


export function mapInsHashtag(hashtags: InsSearching): InsHashtag[] {
    const result: InsHashtag[] = [];

    if (!hashtags || !hashtags.xdt_api__v1__fbsearch__topsearch_connection) {
        return result;
    }

    for (const fullHashtag of hashtags.xdt_api__v1__fbsearch__topsearch_connection.hashtags) {
        if (!fullHashtag || !fullHashtag.hashtag) {
            continue; // Skip invalid entries
        }

        const { position, hashtag: { name, media_count, id } } = fullHashtag;

        if (name && media_count && id) {
            const mappedHashtag: InsHashtag = {
                position: position || 0,
                name,
                media_count,
                id,
            };
            result.push(mappedHashtag);
        }
    }

    return result;
}
