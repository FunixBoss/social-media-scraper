import { Channel } from "src/instagram/entity/channel.entity";

export interface InsProfileFull {
    user?: {
        account_badges?: any[];
        account_type?: number;
        address_street?: string;
        ai_agent_type?: any;
        biography?: string;
        biography_with_entities?: {
            entities?: {
                hashtag?: any;
                user?: {
                    id?: string;
                    username?: string;
                }
            }[];
        };
        bio_links?: {
            link_type?: string;
            lynx_url?: string;
            title?: string;
            url?: string;
        }[];
        category?: string;
        city_name?: string;
        eligible_for_text_app_activation_badge?: boolean;
        external_lynx_url?: string;
        external_url?: string;
        fbid_v2?: string;
        follower_count?: number;
        following_count?: number;
        friendship_status?: {
            blocking?: boolean;
            followed_by?: boolean;
            following?: boolean;
            incoming_request?: boolean;
            is_bestie?: boolean;
            is_feed_favorite?: boolean;
            is_muting_reel?: boolean;
            is_restricted?: boolean;
            muting?: boolean;
            outgoing_request?: boolean;
        };
        full_name?: string;
        gating?: any;
        has_chaining?: boolean;
        has_story_archive?: any;
        hd_profile_pic_url_info?: {
            url?: string;
        };
        id?: string;
        interop_messaging_user_fbid?: string;
        is_business?: boolean;
        is_embeds_disabled?: boolean;
        is_memorialized?: boolean;
        is_private?: boolean;
        is_professional_account?: any;
        is_regulated_c18?: boolean;
        is_unpublished?: boolean;
        is_verified?: boolean;
        latest_besties_reel_media?: number;
        latest_reel_media?: number;
        live_broadcast_id?: any;
        live_broadcast_visibility?: any;
        media_count?: number;
        mutual_followers_count?: number;
        pk?: string;
        pronouns?: any[];
        profile_context_links_with_user_ids?: any[];
        profile_pic_url?: string;
        regulated_news_in_locations?: any[];
        reel_media_seen_timestamp?: any;
        show_account_transparency_details?: boolean;
        show_text_post_app_badge?: any;
        should_show_category?: boolean;
        supervision_info?: any;
        text_post_app_badge_label?: any;
        total_clips_count?: number;
        transparency_label?: any;
        transparency_product?: any;
        username?: string;
        zip?: string;
    };
    viewer?: {
        user?: {
            can_see_organic_insights?: boolean;
            has_onboarded_to_text_post_app?: boolean;
            id?: string;
            pk?: string;
        };
    };
}

export function mapInsProfile(profile: InsProfileFull): Channel {
    return {
        biography: profile.user?.biography ?? '',
        bio_link_url: profile.user?.bio_links && profile.user.bio_links.length > 0 
            ? profile.user.bio_links[0].url
            : null,
        category: profile.user?.category ?? '',
        external_url: profile.user?.external_url ?? '',
        follower_count: profile.user?.follower_count ?? 0,
        following_count: profile.user?.following_count ?? 0,
        full_name: profile.user?.full_name ?? '',
        profile_pic_url: profile.user?.profile_pic_url ?? '',
        hd_profile_pic_url_info: profile.user?.hd_profile_pic_url_info?.url ?? '',
        id: profile.user?.id ?? '',
        media_count: +profile.user?.media_count ?? 0,
        pk: profile.user?.pk ?? '',
        username: profile.user?.username ?? '',
        is_self_adding: true,
        is_bot_scanning: false
    }
}
