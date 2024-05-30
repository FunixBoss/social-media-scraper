import { PipeTransform, Injectable, HttpException } from '@nestjs/common';
import { CreateProxyDTO } from '../dto/create-proxy.dto';

@Injectable()
export class ParseRotatingProxyIpv4 implements PipeTransform {
    constructor() { }

    async transform(value: any): Promise<CreateProxyDTO> {
        try {
            const proxyStr: string[] = value.proxy.split(":").map(p => p.trim());
            if (proxyStr.length != 2) throw new Error();
            return {
                api_key: value.api_key,
                supplier: value.supplier,
                proxy: {
                    ip: proxyStr[0],
                    port: +proxyStr[1],
                },
            };
        } catch (error) {
            throw new HttpException('Wrong Rotating Proxy Ipv4', 400);
        }
    }
}
