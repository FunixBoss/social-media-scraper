import { InsPageInfo } from "./InsPageInfo";

export type InsHighlights = {
    highlights: InsHighlight[];
    page_info: InsPageInfo;
}

export type InsHighlight = {
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
    cursor: string;
};