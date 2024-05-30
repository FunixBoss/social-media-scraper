import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProxyIpv4Service } from './service/proxy-ipv4.service';
import { CreateProxyDTO } from './dto/create-proxy.dto';
import { ParseProxyIpv4 } from './pipe/parse-proxy-ip-v4.pipe';
import { ProxyByIdPipe } from './pipe/proxy-by-id.pipe';
import { ProxyIpv4 } from '../entity/proxy-ipv4.entity';
import ProxyIpv4DTO from './dto/proxy.dto';

@Controller('proxy-ipv4')
export class ProxyIpv4Controller {
  constructor(private readonly proxyService: ProxyIpv4Service) { }

  @Get()
  async findAll(): Promise<ProxyIpv4DTO[]> {
    return this.proxyService.findAll();
  }
  
  @Get('check-all')
  async checkAll(): Promise<void> {
    await this.proxyService.checkAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProxyIpv4DTO> {
    return this.proxyService.findOne(+id);
  }


  @Get('check/:id')
  async check(@Param('id', ProxyByIdPipe) proxy: ProxyIpv4): Promise<ProxyIpv4DTO> {
    return this.proxyService.check(proxy);
  }


  @Post()
  create(@Body(ParseProxyIpv4) createProxyDTO: CreateProxyDTO): Promise<ProxyIpv4DTO> {
    return this.proxyService.create(createProxyDTO);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proxyService.remove(+id);
  }
}
