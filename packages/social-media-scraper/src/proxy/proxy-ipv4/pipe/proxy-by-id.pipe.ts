import { PipeTransform, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { ProxyIpv4 } from 'src/proxy/entity/proxy-ipv4.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProxyByIdPipe implements PipeTransform {
    constructor(
        @InjectRepository(ProxyIpv4, 'social-media-scraper-proxy') private readonly proxyRepository: Repository<ProxyIpv4>,
    ) { }

    async transform(id: number): Promise<ProxyIpv4> {
        const user = await this.proxyRepository.findOneBy({ id });
        if (!user) {
            throw new EntityNotExists('Proxy', id.toString());
        }
        return user;
    }
}
