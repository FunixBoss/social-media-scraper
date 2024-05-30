export type InsFriendshipUserFull = {
    xdt_api__v1__discover__chaining: {
        users: InsFriendshipUser[]
    }
}

export type InsFriendshipUser = {
    username: string;
    full_name: string;
    pk: string;
    id: string;
    friendship_status: string;
    profile_pic_url: string;
    is_verified: boolean;
    is_private: boolean;
    supervision_info: string;
    __typename: string;
    social_context: string;
}

