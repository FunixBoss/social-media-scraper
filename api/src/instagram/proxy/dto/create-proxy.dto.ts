import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ProxyIpv4 } from "../types/proxy-ipv4";

export class CreateProxyDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    proxy: ProxyIpv4;

    @IsOptional()
    @IsDateString()
    import_date: string;

    @IsOptional()
    @IsDateString()
    expiration_date: string;
}
