import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class PostsReelsDownloadType {
    @IsOptional()
    @IsBoolean()
    all?: boolean;

    @IsOptional()
    @IsNumber()
    from_order?: number;

    @IsOptional()
    @IsNumber()
    to_order?: number;
}

export class DownloadType {
    @IsOptional()
    @ValidateNested()
    @Type(() => PostsReelsDownloadType)
    posts?: PostsReelsDownloadType;

    @IsOptional()
    @ValidateNested()
    @Type(() => PostsReelsDownloadType)
    reels?: PostsReelsDownloadType;
}