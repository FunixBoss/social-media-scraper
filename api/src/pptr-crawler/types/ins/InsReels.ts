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
        !reels.xdt_api__v1__clips__user__connection_v2 ||
        !reels.xdt_api__v1__clips__user__connection_v2.edges
    ) {
        throw new Error('Invalid input data');
    }

    for (const edge of reels.xdt_api__v1__clips__user__connection_v2.edges) {
        const node = edge.node;

        const mappedReel: ChannelReel = {
            code: node.media.code,
            comment_count: node.media.comment_count,
            id: node.media.id,
            image_height: node.media.original_height,
            image_width: node.media.original_width,
            image_url: node.media.image_versions2?.candidates[0]?.url ?? null,
            like_count: node.media.like_count,
            media_type: node.media.media_type,
            pk: node.media.pk,
            play_count: node.media.play_count,
            product_type: node.media.product_type,
            video_url: (node.media.video_versions?.[0]?.url) ?? '',
        };
        mappedReels.push(mappedReel);
    }
    return mappedReels;
}