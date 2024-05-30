import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { RotatingProxyIpv4Std } from "./rotating-proxy-ipv4-std";

export class CreateProxyDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    proxy: RotatingProxyIpv4Std;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    supplier: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    api_key: string;
}
