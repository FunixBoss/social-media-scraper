import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class GetKeywordNameParamsDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    name: string;
  }