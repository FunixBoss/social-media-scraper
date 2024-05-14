import { Injectable, Logger } from '@nestjs/common';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ProxyDTO from './dto/proxy.dto';
import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios';
import { lookup } from 'geoip-lite';
import { ProxyIpv4 } from './types/proxy-ipv4';
import { Proxy } from './entity/proxy.entity';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  constructor(
    @InjectRepository(Proxy) private readonly proxyRepository: Repository<Proxy>,
  ) {
  }

  async getRandom(): Promise<ProxyDTO> {
    const randomProxy = await this.proxyRepository
      .createQueryBuilder('proxy')
      .where('proxy.status = :status', { status: 'live' })
      .orderBy('RAND()') // Corrected for MySQL
      .getOne();

    if (!randomProxy) {
      this.logger.warn('No live proxy found in the database.');
      throw new Error('No live proxy available');
    }

    this.logger.log('Random live proxy retrieved successfully.');
    return new ProxyDTO(await this.proxyRepository.save(randomProxy));
  }

  async checkAll(): Promise<void> {
    const proxies: Proxy[] = await this.proxyRepository.find()
    let checkPromises: Promise<any>[] = []
    proxies
      .map(proxy => this.check(proxy))
      .forEach(promise => checkPromises.push(promise))
    await Promise.all(checkPromises)
      .then(() => this.logger.log("Check All Proxies Successfully"))
      .catch(() => this.logger.error("Check All Proxies Failed"));
  }

  async check(proxy: Proxy): Promise<ProxyDTO> {
    const { ip, port, username, password } = proxy
    proxy = {
      ...proxy,
      country_code: await this.checkProxyGeolocation(ip),
      status: await this.checkProxy({ ip, port: +port, username, password }) ? 'live' : 'die',
      last_checked: new Date()
    }
    return new ProxyDTO(await this.proxyRepository.save(proxy));
  }

  async create(createProxyDto: CreateProxyDto): Promise<ProxyDTO> {
    const { ip, port, username, password } = createProxyDto.proxy;
    let proxy: Proxy = {
      ip,
      port: port.toString(),
      username,
      password,
      import_date: new Date(createProxyDto.import_date),
      expiration_date: new Date(createProxyDto.expiration_date),
      last_checked: new Date(),
      last_used: new Date(),
      country_code: await this.checkProxyGeolocation(ip),
      status: await this.checkProxy(createProxyDto.proxy) ? 'live' : 'die'
    };
    return new ProxyDTO(await this.proxyRepository.save(proxy));
  }

  private async checkProxyGeolocation(ip: string): Promise<string> {
    let geo = lookup(ip);
    return geo.country;
  }

  private async checkProxy({ ip, port, username, password }: ProxyIpv4): Promise<boolean> {
    const proxyUrl = `http://${username}:${password}@${ip}:${port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    try {
      const response = await axios.get('http://httpbin.org/ip', { httpAgent: agent, timeout: 5000 });
      console.log('Proxy is live:', response.data);
      return true;
    } catch (error) {
      console.error('Proxy might be dead. Error:', error.message);
      return false;
    }
  }

  async findAll(): Promise<ProxyDTO[]> {
    return (await this.proxyRepository.find()).map(proxy => new ProxyDTO(proxy));
  }

  async findOne(id: number): Promise<ProxyDTO> {
    const proxy = await this.proxyRepository.findOneBy({ id })
    console.log(proxy);

    return new ProxyDTO(proxy);
  }

  async remove(id: number): Promise<void> {
    this.proxyRepository.delete(id);
  }
}
