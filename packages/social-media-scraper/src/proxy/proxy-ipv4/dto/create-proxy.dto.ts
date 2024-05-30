import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { ProxyIpv4Std } from "./proxy-ipv4-std";

export class CreateProxyDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    proxy: ProxyIpv4Std;

    @IsOptional()
    @IsDateString()
    import_date: string;

    @IsOptional()
    @IsDateString()
    expiration_date: string;
}
