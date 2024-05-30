import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsNumber, IsOptional } from "class-validator";

export class GetDownloadTypeDTO {
    @IsIn(["posts", "reels"])
    type: "posts" | "reels";
  
    @IsOptional()
    @IsBoolean()
    all: boolean;

    @Type(() => Number)
    @IsNumber()
    from_order: number;
  
    @Type(() => Number)
    @IsNumber()
    to_order: number;
  }