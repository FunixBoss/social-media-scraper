export type InsFriendshipUserFull = {
    xdt_api__v1__discover__chaining: {
        users: InsFriendshipUser[]
    }
}

export type InsFriendshipUsers = {
    users: InsFriendshipUser[],
    len: number;
}

export type InsFriendshipUser = {
    id: string;
    friendship_status: string;
    full_name: string;
    is_verified: boolean;
    pk: string;
    profile_pic_url: string;
    username: string;
    is_private: boolean;
    supervision_info: string;
    __typename: string;
    social_context: string;
}

