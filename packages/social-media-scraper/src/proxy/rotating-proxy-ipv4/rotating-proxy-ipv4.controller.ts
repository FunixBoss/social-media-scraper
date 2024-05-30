import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CreateProxyDTO } from './dto/create-proxy.dto';
import { RotatingProxyIpv4Service } from './service/rotating-proxy-ipv4.service';
import { RotatingProxyIpv4ByIdPipe } from './pipe/proxy-by-id.pipe';
import RotatingProxyIpv4DTO from './dto/proxy.dto';
import { RotatingProxyIpv4 } from '../entity/rotating-proxy-ipv4.entity';
import { ParseRotatingProxyIpv4 } from './pipe/parse-rotating-proxy-ip-v4.pipe';

@Controller('rotating-proxy-ipv4')
export class RotatingProxyIpv4Controller {
  constructor(private readonly proxyService: RotatingProxyIpv4Service) { }

  @Get()
  async findAll(): Promise<RotatingProxyIpv4DTO[]> {
    return this.proxyService.findAll();
  }

  @Get('check-all')
  async checkAll(): Promise<void> {
    await this.proxyService.checkAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RotatingProxyIpv4DTO> {
    return this.proxyService.findOne(+id);
  }


  @Get('check/:id')
  async check(@Param('id', RotatingProxyIpv4ByIdPipe) proxy: RotatingProxyIpv4): Promise<void> {
    await this.proxyService.check(proxy);
  }

  @Post()
  create(@Body(ParseRotatingProxyIpv4) createProxyDTO: CreateProxyDTO): Promise<RotatingProxyIpv4DTO> {
    return this.proxyService.create(createProxyDTO);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proxyService.remove(+id);
  }
}
