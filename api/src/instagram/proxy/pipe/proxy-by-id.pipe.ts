import { PipeTransform, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotExists } from 'src/exception/entity-not-exists.exception';
import { Proxy } from 'src/instagram/entity/proxy.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProxyByIdPipe implements PipeTransform {
    constructor(
        @InjectRepository(Proxy) private readonly proxyRepository: Repository<Proxy>,
    ) { }

    async transform(id: number): Promise<Proxy> {
        const user = await this.proxyRepository.findOneBy({ id });
        if (!user) {
            throw new EntityNotExists('Proxy', id.toString());
        }
        return user;
    }
}
