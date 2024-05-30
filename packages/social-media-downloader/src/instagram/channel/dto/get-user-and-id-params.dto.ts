import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class GetUserNIdParamsDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    username: string;
  
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    id: number;
  }