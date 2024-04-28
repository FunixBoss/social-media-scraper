export default interface FindAllHashtagDTO {
    id?: number;
    code?: string;
    media_count?: number;
    category?: string;
    is_self_adding?: boolean;
    is_bot_scanning?: boolean;
    priority?: string;
    keyword?: string;
}
