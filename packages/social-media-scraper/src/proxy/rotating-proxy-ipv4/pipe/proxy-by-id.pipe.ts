import { PipeTransform, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { RotatingProxyIpv4 } from 'src/proxy/entity/rotating-proxy-ipv4.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RotatingProxyIpv4ByIdPipe implements PipeTransform {
    constructor(
        @InjectRepository(RotatingProxyIpv4, 'social-media-scraper-proxy') private readonly proxyRepository: Repository<RotatingProxyIpv4>,
    ) { }

    async transform(id: number): Promise<RotatingProxyIpv4> {
        const user = await this.proxyRepository.findOneBy({ id });
        if (!user) {
            throw new EntityNotExists('Proxy', id.toString());
        }
        return user;
    }
}
