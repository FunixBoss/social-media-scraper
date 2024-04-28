export default interface ChannelPostDTO {
    code?: string;
    url?: string;
    caption_text?: string;
    channel_post_numerical_order?: number;
    carousel_media_count?: number;
    original_height?: number;
    original_width?: number;
    video_height?: number;
    video_width?: number;
    video_url?: string;
    video_type?: number;
    comment_count?: number;
    product_type?: string;
    image_urls?: string[];
}