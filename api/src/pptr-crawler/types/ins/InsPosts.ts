import { ChannelPostImage } from "src/instagram/entity/channel-post-image.entity";
import { ChannelPost } from "src/instagram/entity/channel-post.entity";

export type InsPostsFull = {
  xdt_api__v1__feed__user_timeline_graphql_connection: {
    edges: InsPostFull[]
  }
}

export type InsPostFull = {
  cursor?: string;
  node?: {
    accessibility_caption?: string;
    ad_id?: string;
    affiliate_info?: string;
    audience?: string;
    boost_unavailable_identifier?: any;
    boost_unavailable_reason?: any;
    boosted_status?: any
    can_reshare?: boolean
    can_see_insights_as_brand?: boolean
    can_viewer_reshare?: boolean
    caption?: {
      created_at?: number;
      has_translation?: boolean;
      pk?: string;
      text?: string;
    }
    caption_is_edited?: boolean;
    carousel_media?: InsPostCarouselMedia[];
    carousel_media_count?: number;
    carousel_parent_id?: string;
    clips_attribution_info?: string;
    clips_metadata?: {
      audio_type: string;
      achievements_info: {
        show_achievements: boolean;
      };
      music_info: null;
      original_sound_info: {
        original_audio_title: string;
        should_mute_audio: boolean;
        audio_asset_id: string;
        consumption_info: {
          is_trending_in_clips: boolean;
          should_mute_audio_reason: string;
          should_mute_audio_reason_type: null;
        };
        ig_artist: {
          username: string;
          id: string;
        };
        is_explicit: boolean;
      };
    };
    coauthor_producers?: null;
    code?: string;
    comment_count?: number;
    commenting_disabled_for_viewer?: null;
    comments?: []
    comments_disabled?: null;
    expiring_at?: null;
    explore?: null;
    facepile_top_likers?: null;
    feed_demotion_control?: null;
    feed_recs_demotion_control?: null;
    follow_hashtag_info?: null;
    group?: null;
    has_audio?: boolean;
    has_liked?: boolean;
    has_viewer_saved?: null;
    headline?: null;
    id?: string;
    ig_media_sharing_disabled?: boolean;
    image_versions2?: {
      candidates?: {
        height?: number;
        width?: number;
        url?: string;
      }[]
    };
    inventory_source?: null;
    invited_coauthor_producers?: any[];
    is_dash_eligible?: boolean;
    is_paid_partnership?: boolean;
    is_seen?: boolean;
    like_and_view_counts_disabled?: boolean;
    like_count?: number;
    link?: null;
    location?: {
      pk?: number;
      lat?: number;
      lng?: number;
      name?: string;
      profile_pic_url?: string | null;
    };
    logging_info_token?: null;
    main_feed_carousel_starting_media_id?: null;
    media_cropping_info?: {
      square_crop: {
        crop_bottom: number;
        crop_left: number;
        crop_right: number;
        crop_top: number;
      };
    };
    media_overlay_info?: null;
    media_type?: number;
    number_of_qualities?: null;
    organic_tracking_token?: string;
    original_height?: number;
    original_width?: number;
    owner?: {
      friendship_status?: {
        is_feed_favorite?: boolean;
        following?: boolean;
        is_restricted?: boolean;
        is_bestie?: boolean;
      };
      full_name?: string;
      id?: string;
      is_embeds_disabled?: boolean | null;
      is_unpublished?: boolean;
      is_verified?: boolean;
      pk?: string;
      profile_pic_url?: string | null;
      show_account_transparency_details?: boolean;
      supervision_info?: any; // You might want to replace `any` with a more specific type if available
      transparency_product?: any; // You might want to replace `any` with a more specific type if available
      transparency_product_enabled?: boolean;
      transparency_label?: any; // You might want to replace `any` with a more specific type if available
      username?: string;
      is_private?: boolean;
      __typename?: string;
    }
    photo_of_you?: boolean;
    pk?: string;
    preview?: null;
    product_type?: string; // 'clips'
    saved_collection_ids?: null;
    share_urls?: null;
    sharing_friction_info?: {
      bloks_app_url?: null;
      should_have_sharing_friction?: boolean;
    }
    social_context?: null;
    sponsor_tags?: null;
    story_cta?: null;
    taken_at?: number;
    thumbnails?: null;
    timeline_pinned_user_ids
    title?: null;
    top_likers?: string[]
    upcoming_event?: null;
    user?: {
      pk?: string;
      username?: string;
      profile_pic_url?: string;
      is_private?: boolean;
      is_embeds_disabled?: boolean | null;
      is_unpublished?: boolean;
      is_verified?: boolean;
      friendship_status?: {
        following?: boolean;
        is_bestie?: boolean;
        is_feed_favorite?: boolean;
        is_restricted?: boolean;
      };
      latest_besties_reel_media?: number;
      latest_reel_media?: number;
      live_broadcast_visibility?: any; // You might want to replace `any` with a more specific type if available
      live_broadcast_id?: any; // You might want to replace `any` with a more specific type if available
      seen?: any; // You might want to replace `any` with a more specific type if available
      supervision_info?: any; // You might want to replace `any` with a more specific type if available
      id?: string;
      hd_profile_pic_url_info?: {
        url?: string;
      };
      __typename?: string;
    }
    usertags?: {
      user?: {
        pk?: string;
        full_name?: string;
        username?: string;
        profile_pic_url?: string;
        is_verified?: boolean;
        id?: string;
      };
      position?: [number, number];
    }[];
    video_dash_manifest?: string;
    video_versions?: {
      width: number;
      height: number;
      url: string;
      type: number;
    }[];
    view_count?: null;
    visibility?: null;
    __typename?: string;
  }
};

export type InsPostCarouselMedia = {
  id: string;
  pk: string;
  accessibility_caption: string;
  is_dash_eligible: null;
  video_dash_manifest: null;
  media_type: number;
  original_height: number;
  original_width: number;
  inventory_source: null;
  user: null;
  usertags: {
    in: {
      user: {
        pk: string;
        full_name: string;
        username: string;
        profile_pic_url: string;
        is_verified: boolean;
        id: string;
      };
      position: [number, number];
    }[];
  };
  image_versions2: {
    candidates: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  carousel_parent_id: string;
  sharing_friction_info: {
    bloks_app_url: null;
    should_have_sharing_friction: boolean;
  };
  preview: string;
  organic_tracking_token: null;
  saved_collection_ids: null;
  has_viewer_saved: null;
  video_versions: null;
  media_overlay_info: null;
  number_of_qualities: null;
  link: null;
  story_cta: null;
  carousel_media: null;
}

export async function mapInsPosts(posts: InsPostsFull): Promise<ChannelPost[]> {
  const insPosts: ChannelPost[] = [];

  if (posts && posts.xdt_api__v1__feed__user_timeline_graphql_connection && posts.xdt_api__v1__feed__user_timeline_graphql_connection.edges) {
    posts.xdt_api__v1__feed__user_timeline_graphql_connection.edges.forEach((edge) => {
      const node = edge.node;
      let images: ChannelPostImage[] = []
      if (node.product_type == 'carousel_container') {
        images = node.carousel_media.map((carouselItem) => {
          if (!carouselItem || !carouselItem.image_versions2 || !carouselItem.image_versions2.candidates || carouselItem.image_versions2.candidates.length === 0) {
            return null;
          }

          return {
            image_height: carouselItem.image_versions2.candidates[0].height,
            image_width: carouselItem.image_versions2.candidates[0].width,
            image_url: carouselItem.image_versions2.candidates[0].url
          };
        }).filter(Boolean)
      } else if(node.product_type == 'feed') {
        const image = node.image_versions2.candidates[0]
        images.push({
          image_url: image.url,
          image_height: image.height,
          image_width: image.width
        })
      }

      let insPost: ChannelPost = {
        caption_text: node.caption ? node.caption.text : '',
        carousel_media_count: node.carousel_media_count,
        images: images,
        like_count: node.like_count,
        original_height: node.original_height,
        original_width: node.original_width,
        video_height: node.video_versions && node.video_versions.length > 0 ? node.video_versions[0].height : null,
        video_width: node.video_versions && node.video_versions.length > 0 ? node.video_versions[0].width : null,
        video_url: node.video_versions && node.video_versions.length > 0 ? node.video_versions[0].url : null,
        video_type: node.video_versions && node.video_versions.length > 0 ? node.video_versions[0].type : null,
        code: node.code,
        comment_count: node.comment_count,
        product_type: node.product_type,
      };
      insPosts.push(insPost);
    });
  }

  return insPosts;
}
