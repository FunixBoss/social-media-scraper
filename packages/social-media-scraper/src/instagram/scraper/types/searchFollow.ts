import { User } from "./PostModels";

export interface ISearchFollow {
    users?:                          UserFollow[];
    big_list?:                       boolean;
    page_size?:                      number;
    has_more?:                       boolean;
    should_limit_list_of_followers?: boolean;
    use_clickable_see_more?:         boolean;
    show_spam_follow_request_tab?:   boolean;
    status?:                         string;
}

export type UserFollow = User & {
    pk_id?:                         string;
    third_party_downloads_enabled?: number;
    strong_id__?:                   string;
}