import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { IsValidPriority } from '../../pipe/is-valid-priority.validation';

export class CreateKeywordDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    name: string;

    @IsValidPriority()
    priority: string;
}
