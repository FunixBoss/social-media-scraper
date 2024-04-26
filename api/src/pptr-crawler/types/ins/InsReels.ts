export type InsReels = {
    reels: InsReel[];
    len: number;
}

export type InsReel = {
    code: string;
    comment_count: number;
    id: string;
    image: {
        height: number;
        width: number;
        urL: string;
    };
    like_count: number;
    media_type: number;
    pk: string;
    play_count: number;
    product_type: string;
    video_url: string;
}

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

export function mapInsReels(reels: InsReelsFull): InsReel[] {
    const mappedReels: InsReel[] = [];

    if (
        !reels ||
        !reels.xdt_api__v1__clips__user__connection_v2 ||
        !reels.xdt_api__v1__clips__user__connection_v2.edges
    ) {
        throw new Error('Invalid input data');
    }

    // Loop through the edges and map each reel
    for (const edge of reels.xdt_api__v1__clips__user__connection_v2.edges) {
        const node = edge.node;

        // Check if the required fields exist in the current node
        if (
            !node ||
            !node.media ||
            !node.media.pk ||
            !node.media.id ||
            !node.media.code ||
            !node.media.media_type ||
            !node.media.user ||
            !node.media.user.pk ||
            !node.media.user.id
        ) {
            // If any required field is missing, skip this node
            continue;
        }

        // Map the reel data
        const mappedReel: InsReel = {
            code: node.media.code,
            comment_count: node.media.comment_count,
            id: node.media.id,
            image: {
                height: node.media.original_height,
                width: node.media.original_width,
                urL: (node.media.image_versions2?.candidates[0]?.url) ?? '',
            },
            like_count: node.media.like_count,
            media_type: node.media.media_type,
            pk: node.media.pk,
            play_count: node.media.play_count,
            product_type: node.media.product_type,
            video_url: (node.media.video_versions?.[0]?.url) ?? '',
        };

        // Add the mapped reel to the result array
        mappedReels.push(mappedReel);
    }

    // Return the mapped reels
    return mappedReels;
}