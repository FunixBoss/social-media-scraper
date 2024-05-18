import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProxyIpv4 } from "../entity/proxy-ipv4.entity";
import { ProxyIpv4Controller } from "./proxy-ipv4.controller";
import { ProxyIpv4Service } from "./service/proxy-ipv4.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([ProxyIpv4 ], 'social-media-scraper-proxy'),
  ],
  controllers: [ProxyIpv4Controller],
  providers: [ProxyIpv4Service],
  exports: [ProxyIpv4Service]
}) 
export class ProxyIpv4Module { }
 