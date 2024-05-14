import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { CreateProxyDto } from './dto/create-proxy.dto';
import ProxyDTO from './dto/proxy.dto';
import { ParseProxyIpv4 } from './pipe/parse-proxy-ip-v4.pipe';
import { ProxyByIdPipe } from './pipe/proxy-by-id.pipe';
import { Proxy } from './entity/proxy.entity';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) { }

  @Get()
  async findAll(): Promise<ProxyDTO[]> {
    return this.proxyService.findAll();
  }
  
  @Get('check-all')
  async checkAll(): Promise<void> {
    await this.proxyService.checkAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProxyDTO> {
    return this.proxyService.findOne(+id);
  }


  @Get('check/:id')
  async check(@Param('id', ProxyByIdPipe) proxy: Proxy): Promise<ProxyDTO> {
    return this.proxyService.check(proxy);
  }


  @Post()
  create(@Body(ParseProxyIpv4) createProxyDto: CreateProxyDto): Promise<ProxyDTO> {
    console.log(createProxyDto);

    return this.proxyService.create(createProxyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proxyService.remove(+id);
  }
}
