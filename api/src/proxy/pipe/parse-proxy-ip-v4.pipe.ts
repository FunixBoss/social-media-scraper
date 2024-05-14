import { PipeTransform, Injectable, HttpException } from '@nestjs/common';
import { CreateProxyDto } from '../dto/create-proxy.dto';
import { moment } from 'src/main';

@Injectable()
export class ParseProxyIpv4 implements PipeTransform {
    constructor() { }

    async transform(value: any): Promise<CreateProxyDto> {
        console.log(value);

        try {
            const proxyStr: string[] = value.proxy.split(":").map(p => p.trim());
            if (proxyStr.length != 4) throw new Error();
            return {
                proxy: {
                    ip: proxyStr[0],
                    port: +proxyStr[1],
                    username: proxyStr[2],
                    password: proxyStr[3]
                },
                import_date: value.import_date,
                expiration_date: value.expiration_date
            };
        } catch (error) {
            throw new HttpException('Wrong Proxy Ipv4', 400);
        }
    }
}
