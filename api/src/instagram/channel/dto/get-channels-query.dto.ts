import { IsEmpty, IsIn, IsNumber, IsOptional, MaxLength } from "class-validator";

export class GetChannelsQueryDTO {
    @IsEmpty()
    @IsIn([undefined, "username", "category", "follower_count", "full_name", "total_posts", "total_reels", "total_friendships"])
    sortField: string;

    @IsEmpty()
    @IsIn([undefined, "ASC", "DESC"])
    sortDirection: string;

    @IsOptional()
    page: number;

    @IsOptional()
    pageSize: number;

    @IsOptional()
    @MaxLength(200)
    username: string;

    @IsIn([undefined, "equals", "contains", "startsWith", "endsWith"])
    usernameFilterType: string;

    @IsOptional()
    @IsNumber()
    minFollower: number;

    @IsOptional()
    @IsNumber()
    maxFollower: number;

    @IsIn([undefined, "SELF_ADDING", "BOT_SCANNING"])
    classify: string;

    @IsIn([undefined, "LOW", "MEDIUM", "HIGH"])
    priority: string;
}