import { Type } from "class-transformer";
import { IsBoolean, IsNumber, IsObject, IsOptional, ValidateNested } from "class-validator";

export class CrawlInfo {
    @IsOptional()
    @IsBoolean()
    profile?: boolean;

    @IsOptional()
    @IsBoolean()
    friendships?: boolean;

    @IsOptional()
    @IsBoolean()
    posts?: boolean;

    @IsOptional()
    @IsBoolean()
    reels?: boolean;
}

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

export class ExportType {
    @IsOptional()
    @IsBoolean()
    json?: boolean;

    @IsOptional()
    @IsBoolean()
    excel?: boolean;
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

export class GetUserScrapeInfosDTO {
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => CrawlInfo)
    crawl?: CrawlInfo;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => ExportType)
    export?: ExportType;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DownloadType)
    download?: DownloadType;
}
