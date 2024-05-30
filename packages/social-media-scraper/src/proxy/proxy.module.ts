import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProxyIpv4Module } from './proxy-ipv4/proxy-ipv4.module';
import { RotatingProxyIpv4Module } from './rotating-proxy-ipv4/rotating-proxy-ipv4.module';

@Module({
  imports: [
    TypeOrmModule,
    ProxyIpv4Module,
    RotatingProxyIpv4Module
  ],
  exports: [
    ProxyIpv4Module,
    RotatingProxyIpv4Module
  ]
}) 
export class ProxyModule { }
