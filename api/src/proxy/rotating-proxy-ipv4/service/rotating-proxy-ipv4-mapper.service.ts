import { RotatingProxyIpv4 } from "src/proxy/entity/rotating-proxy-ipv4.entity";
import RotatingProxyIpv4DTO from "../dto/proxy.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class RotatingProxyIpv4MapperService {
    constructor() { }

    mapToEntity(proxy: RotatingProxyIpv4DTO): RotatingProxyIpv4 {
        return {
            ip: proxy.ip,
            id: proxy.id,
            api_key: proxy.api_key,
            supplier: proxy.supplier,
            port: proxy.port,
            country_code: proxy.country_code,
            last_checked: new Date(proxy.last_checked),
            status: proxy.status,
            last_ip: proxy.last_ip
        }
    }
}