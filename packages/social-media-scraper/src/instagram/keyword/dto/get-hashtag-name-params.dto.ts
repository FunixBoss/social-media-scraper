import { IsNotEmpty, IsString, MaxLength } from "class-validator";
export class GetHashtagNameParamsDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    name: string;
  }