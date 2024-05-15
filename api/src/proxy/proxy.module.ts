import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proxy } from './entity/proxy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proxy], 'social-media-scraper-proxy'),
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [
    ProxyService
  ]
}) 
export class ProxyModule { }
