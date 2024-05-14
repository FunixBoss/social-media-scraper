import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateAccountDto {

    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsString()
    twoFactorAuthentication: string;

    @IsOptional()
    @IsString()
    cookie_string: string;

    @IsOptional()
    @IsEmail()
    mail: string;
}
