import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateMultiKeywordDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(10000)
    name: string[];
}
