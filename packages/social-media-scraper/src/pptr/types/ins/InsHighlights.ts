import { InsPageInfo } from "./InsPageInfo";

export type InsHighlights = {
    highlights: InsHighlight[];
    len: number;
}

export type InsHighlight = {
    id: string;
    title: string;
    image: string;
}

export type InsHighlightsFull = {
    highlights: {
        edges: InsHighlightFull[]
        page_info: InsPageInfo
    }
}

export type InsHighlightFull = {
    cursor: string;
    node: {
        id: string;
        title: string;
        cover_media: {
            cropped_image_version: {
                url: string;
            };
        };
        user: {
            username: string;
            id: null;
        };
        __typename: string;
    };
};

export function mapInsHighlight(highlightsFull: InsHighlightsFull): InsHighlight[] {
    return highlightsFull.highlights.edges.map((highlightFull) => {
        const {
            node: {
                id,
                title,
                cover_media: { cropped_image_version },
            },
        } = highlightFull;

        const image = cropped_image_version?.url ?? ''; // Provide a default value for the image URL if it's missing

        return {
            id,
            title,
            image,
        };
    });
}
