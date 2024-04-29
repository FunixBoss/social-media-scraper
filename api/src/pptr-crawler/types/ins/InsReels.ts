import { ChannelReel } from "src/instagram/entity/channel-reel.entity";

export type InsReelsFull = {
    xdt_api__v1__clips__user__connection_v2: {
        edges: IntReelsEdgeFull[],
        pages_info: {
            end_cursor: string;
            has_next_page: boolean;
            has_previous_page: boolean;
            start_cursor: string;
        }
    }
}

export type IntReelsEdgeFull = {
    node: {
        media: {
            pk: string;
            id: string;
            code: string;
            media_type: number;
            user: {
                pk: string;
                id: string;
            };
            video_versions: {
                url: string;
                type: number;
            }[];
            carousel_media: any; // Assuming this can be null or undefined
            image_versions2: {
                candidates: {
                    height: number;
                    url: string;
                    width: number;
                }[];
            };
            product_type: string;
            play_count: number;
            view_count: number | null; // Assuming this can be null
            like_and_view_counts_disabled: boolean;
            comment_count: number;
            like_count: number;
            audience: any; // Assuming this can be null or undefined
            original_height: number;
            original_width: number;
        };
        __typename: string;
    };
    cursor: string;
};

export function mapInsReels(reels: InsReelsFull): ChannelReel[] {
    const mappedReels: ChannelReel[] = [];

    if (
        !reels ||
        !reels.xdt_api__v1__clips__user__connection_v2
    ) {
        throw new Error('Invalid input data');
    }

    for (const edge of reels.xdt_api__v1__clips__user__connection_v2.edges) {
        const media = edge.node.media;
        const mappedReel: ChannelReel = {
            code: media.code,
            comment_count: media.comment_count,
            id: media.id,
            image_height: media.original_height,
            image_width: media.original_width,
            image_url: media.image_versions2?.candidates[0]?.url ?? null,
            like_count: media.like_count,
            media_type: media.media_type,
            pk: media.pk,
            play_count: media.play_count,
            product_type: media.product_type,
            video_url: (media.video_versions?.[0]?.url) ?? '',
        };
        console.log(`code: ${media.code} - play_count: ${media.play_count}`);
        
        mappedReels.push(mappedReel);
    }
    return mappedReels;
}