export default interface ChannelPostDTO {
    code?: string;
    url?: string;
    caption_text?: string;
    channel_post_numerical_order?: number;
    carousel_media_count?: number;
    image_urls?: string[];
    video_url?: string;
    video_type?: number;
    like_count: number;
    comment_count?: number;
    product_type?: string;
}