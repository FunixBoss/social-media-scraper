import { Channel } from "src/instagram/entity/channel.entity";
import { PageInfo } from ".";

export interface Graphql {
    data?:   Data;
    status?: string;
}

export interface Data {
    user?: UserGraphQlV2;
}

export interface UserGraphQlV2 {
    ai_agent_type?:                     null;
    biography?:                         string;
    bio_links?:                         BioLink[];
    fb_profile_biolink?:                null;
    biography_with_entities?:           BiographyWithEntities;
    blocked_by_viewer?:                 boolean;
    restricted_by_viewer?:              boolean;
    country_block?:                     boolean;
    eimu_id?:                           string;
    external_url?:                      string;
    external_url_linkshimmed?:          string;
    edge_followed_by?:                  EdgeFollow;
    fbid?:                              string;
    followed_by_viewer?:                boolean;
    edge_follow?:                       EdgeFollow;
    follows_viewer?:                    boolean;
    full_name?:                         string;
    group_metadata?:                    null;
    has_ar_effects?:                    boolean;
    has_clips?:                         boolean;
    has_guides?:                        boolean;
    has_chaining?:                      boolean;
    has_channel?:                       boolean;
    has_blocked_viewer?:                boolean;
    highlight_reel_count?:              number;
    has_requested_viewer?:              boolean;
    hide_like_and_view_counts?:         boolean;
    id?:                                string;
    is_business_account?:               boolean;
    is_professional_account?:           boolean;
    is_supervision_enabled?:            boolean;
    is_guardian_of_viewer?:             boolean;
    is_supervised_by_viewer?:           boolean;
    is_supervised_user?:                boolean;
    is_embeds_disabled?:                boolean;
    is_joined_recently?:                boolean;
    guardian_id?:                       null;
    business_address_json?:             null;
    business_contact_method?:           string;
    business_email?:                    null;
    business_phone_number?:             null;
    business_category_name?:            null;
    overall_category_name?:             null;
    category_enum?:                     null;
    category_name?:                     null;
    is_private?:                        boolean;
    is_verified?:                       boolean;
    is_verified_by_mv4b?:               boolean;
    is_regulated_c18?:                  boolean;
    edge_mutual_followed_by?:           EdgeMutualFollowedBy;
    pinned_channels_list_count?:        number;
    profile_pic_url?:                   string;
    profile_pic_url_hd?:                string;
    requested_by_viewer?:               boolean;
    should_show_category?:              boolean;
    should_show_public_contacts?:       boolean;
    show_account_transparency_details?: boolean;
    transparency_label?:                null;
    transparency_product?:              null;
    username?:                          string;
    connected_fb_page?:                 null;
    pronouns?:                          any[];
    edge_owner_to_timeline_media?:      EdgeOwnerToTimelineMedia;
}

export interface BioLink {
    title?:     string;
    lynx_url?:  string;
    url?:       string;
    link_type?: string;
}

export interface BiographyWithEntities {
    raw_text?: string;
    entities?: any[];
}

export interface EdgeFollow {
    count?: number;
}

export interface EdgeMutualFollowedBy {
    count?: number;
    edges?: EdgeUser[];
}

export interface EdgeUser {
    node?: NodeUsername;
}

export interface NodeUsername {
    username?: string;
}

export interface EdgeOwnerToTimelineMedia {
    count?:     number;
    page_info?: PageInfo;
    edges?:     any[];
}

const defaultOptions = {
    is_bot_scanning: false
}
export function mapUserGraphQLToChannel(userGraphql: UserGraphQlV2, options: { is_bot_scanning: boolean } = defaultOptions): Channel {
    return {
        biography: userGraphql?.biography ?? '',
        bio_link_url:userGraphql?.bio_links && userGraphql.bio_links.length > 0
            ? userGraphql.bio_links[0].url
            : null,
        category: userGraphql?.category_name,
        external_url: userGraphql?.external_url,
        follower_count: userGraphql?.edge_followed_by.count ?? 0,
        following_count: userGraphql?.edge_follow.count,
        full_name: userGraphql?.full_name,
        profile_pic_url: userGraphql?.profile_pic_url,
        hd_profile_pic_url_info: userGraphql?.profile_pic_url_hd,
        id: userGraphql?.id,
        media_count: userGraphql?.edge_owner_to_timeline_media?.count,
        pk: userGraphql?.id,
        username: userGraphql?.username,
        is_self_adding: !options?.is_bot_scanning,
        is_bot_scanning: options?.is_bot_scanning
    }
}