import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateKeywordDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    name: string;
    priority: string;
}
