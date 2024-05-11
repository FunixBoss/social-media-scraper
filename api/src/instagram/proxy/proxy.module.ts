import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proxy } from '../entity/proxy.entity';
import { PptrCrawlerModule } from 'src/pptr-crawler/pptr-crawler.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Proxy
    ]),
    PptrCrawlerModule,
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService]
})
export class ProxyModule {}
