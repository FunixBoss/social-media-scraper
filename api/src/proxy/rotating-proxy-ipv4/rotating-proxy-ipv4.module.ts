import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RotatingProxyIpv4 } from "../entity/rotating-proxy-ipv4.entity";
import { RotatingProxyIpv4Controller } from "./rotating-proxy-ipv4.controller";
import { RotatingProxyIpv4Service } from "./service/rotating-proxy-ipv4.service";
import RotatingProxyIpv4MapperService from "./service/rotating-proxy-ipv4-mapper.service";
import RotateProxyBySupplierService from "./service/rotate-proxy-by-supplier.service";


@Module({
  imports: [
    TypeOrmModule.forFeature([RotatingProxyIpv4], 'social-media-scraper-proxy'),
  ],
  controllers: [RotatingProxyIpv4Controller],
  providers: [RotatingProxyIpv4Service, RotatingProxyIpv4MapperService, RotateProxyBySupplierService],
  exports: [RotatingProxyIpv4Service, RotatingProxyIpv4MapperService, RotateProxyBySupplierService]
}) 
export class RotatingProxyIpv4Module { }
