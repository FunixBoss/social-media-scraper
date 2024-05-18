import { Injectable, Logger } from '@nestjs/common';
import { CreateProxyDTO } from '../dto/create-proxy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ProxyDTO from '../dto/proxy.dto';
import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios';
import { lookup } from 'geoip-lite';
import { ProxyIpv4 } from '../../entity/proxy-ipv4.entity';

@Injectable()
export class ProxyIpv4Service {
  private readonly logger = new Logger(ProxyIpv4Service.name);
  constructor(
    @InjectRepository(ProxyIpv4, 'social-media-scraper-proxy') private readonly proxyRepository: Repository<ProxyIpv4>,
  ) { }

  //#region  check
  async checkAll(): Promise<void> {
    const proxies: ProxyIpv4[] = await this.proxyRepository.find()
    let checkPromises: Promise<any>[] = []
    proxies
      .map(proxy => this.check(proxy))
      .forEach(promise => checkPromises.push(promise))
    await Promise.all(checkPromises)
      .then(() => this.logger.log("Check All Proxies Successfully"))
      .catch(() => this.logger.error("Check All Proxies Failed"));
  }

  async check(proxy: ProxyIpv4): Promise<ProxyDTO> {
    const { ip, port, username, password } = proxy
    proxy = {
      ...proxy,
      country_code: await this.checkProxyGeolocation(ip),
      status: await this.checkProxyStatus({ ip, port: +port, username, password }) ? 'live' : 'die',
      last_checked: new Date()
    }
    return new ProxyDTO(await this.proxyRepository.save(proxy));
  }

  private async checkProxyStatus({ ip, port, username, password }: ProxyIpv4): Promise<boolean> {
    const proxyUrl = `http://${username}:${password}@${ip}:${port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    try {
      const response = await axios.get('http://httpbin.org/ip', { httpAgent: agent, timeout: 5000 });
      this.logger.log(`Proxy Ipv4 is live: ${response.data["origin"]}`);
      return true; 
    } catch (error) {
      this.logger.error('Proxy Ipv4 might be dead. Error:', error.message);
      return false; 
    }
  }

  private async checkProxyGeolocation(ip: string): Promise<string> {
    let geo = lookup(ip);
    return geo.country;
  }
  //#endregion

  //#region crud
  async getRandom(): Promise<ProxyDTO> {
    const randomProxy = await this.proxyRepository
      .createQueryBuilder('proxy-ipv4')
      .where('proxy.status = :status', { status: 'live' })
      .orderBy('RAND()') // Corrected for MySQL
      .getOne();

    if (!randomProxy) {
      this.logger.warn('No live proxy found in the database.');
      throw new Error('No live proxy available');
    }

    this.logger.log('Random live proxy retrieved successfully.');
    return new ProxyDTO(randomProxy);
  }

  async findAll(): Promise<ProxyDTO[]> {
    return (await this.proxyRepository.find()).map(proxy => new ProxyDTO(proxy));
  }

  async findOne(id: number): Promise<ProxyDTO> {
    return new ProxyDTO(await this.proxyRepository.findOneBy({ id }));
  }

  async create(createProxyDTO: CreateProxyDTO): Promise<ProxyDTO> {
    const { ip, port, username, password } = createProxyDTO.proxy;
    let proxy: ProxyIpv4 = {
      ip,
      port,
      username,
      password,
      import_date: new Date(createProxyDTO.import_date),
      expiration_date: new Date(createProxyDTO.expiration_date),
      last_checked: new Date(),
      last_used: new Date(),
      country_code: await this.checkProxyGeolocation(ip),
      status: await this.checkProxyStatus(createProxyDTO.proxy) ? 'live' : 'die'
    };
    return new ProxyDTO(await this.proxyRepository.save(proxy));
  }
 
  async remove(id: number): Promise<void> {
    this.proxyRepository.delete(id);
  }
}
