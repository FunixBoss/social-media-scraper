import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateProxyDTO } from '../dto/create-proxy.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios';
import { lookup } from 'geoip-lite';
import { RotatingProxyIpv4 } from 'src/proxy/entity/rotating-proxy-ipv4.entity';
import RotatingProxyIpv4DTO from '../dto/proxy.dto';
import RotatingProxyIpv4MapperService from './rotating-proxy-ipv4-mapper.service';
import RotateProxyBySupplierService from './rotate-proxy-by-supplier.service';
import { sleep } from 'src/pptr/utils/Utils';

@Injectable()
export class RotatingProxyIpv4Service {
  private readonly logger = new Logger(RotatingProxyIpv4Service.name);
  constructor(
    @InjectRepository(RotatingProxyIpv4, 'social-media-scraper-proxy') private readonly proxyRepository: Repository<RotatingProxyIpv4>,
    @Inject(forwardRef(() => RotateProxyBySupplierService)) private readonly rotateService: RotateProxyBySupplierService,
    private readonly mapperService: RotatingProxyIpv4MapperService,
  ) { }

  async getRandom(): Promise<RotatingProxyIpv4DTO> {
    const randomProxy = await this.proxyRepository
      .createQueryBuilder('rotating-proxy-ipv4')
      .where('rotating-proxy-ipv4.status = :status', { status: 'live' })
      .orderBy('RAND()') // Corrected for MySQL
      .getOne();

    if (!randomProxy) {
      this.logger.warn('No live proxy found in the database.');
      throw new Error('No live proxy available');
    }

    this.logger.log('Random live proxy retrieved successfully.');
    return new RotatingProxyIpv4DTO(randomProxy);
  }

  //#region checking
  async checkAll(): Promise<void> {
    const proxies: RotatingProxyIpv4[] = await this.proxyRepository.find()
    await Promise.all(proxies.map(proxy => this.check(proxy)));
    this.logger.log("Check all rotating proxies successfully")
  }

  async check(proxy: RotatingProxyIpv4): Promise<boolean> {
    return !!await this.getCurrentIp(proxy, { log: true, update: true })
  }

  private async checkProxyGeolocation(ip: string): Promise<string> {
    let geo = lookup(ip);
    return geo.country;
  }
  //#endregion

  async getCurrentIp(
    proxy: RotatingProxyIpv4 | { ip: string, port: number },
    options: { log?: boolean, update?: boolean } = { log: false, update: false }
  ): Promise<string | undefined> {
    const { ip, port } = proxy
    const proxyUrl = `http://:@${ip}:${port}`;
    const agent = new HttpsProxyAgent(proxyUrl);

    let currentIp: string;
    try {
      const response = await axios.get('http://httpbin.org/ip', { httpAgent: agent, timeout: 15000 });
      if (options.log) this.logger.verbose(`Rotating proxy ${ip}:${port} is live, current ip: ${response.data["origin"]}`);
      currentIp = response.data["origin"];
    } catch (error) {
      if (options.log) this.logger.error(`Rotating proxy ${ip}:${port} might be dead. Error: ${error["name"]} - ${error["message"]}`);
    }
    if (options.update) {
      await this.proxyRepository.save({
        ...proxy,
        status: currentIp ? 'live' : 'die',
        last_ip: currentIp
      })
    }
    return currentIp;
  }

  async waitUntilProxiesChangeIp(proxies: RotatingProxyIpv4DTO[], options: { log: boolean } = { log: false }): Promise<void> {
    await Promise.all(proxies.map(proxy => this.waitUntilProxyChangeIp(proxy, options)))
    if (options.log) this.logger.log("All rotating proxies have been changed IP!")
  }

  async waitUntilProxyChangeIp(proxy: RotatingProxyIpv4DTO, options: { log: boolean } = { log: false }): Promise<string> {
    //for rotating by call api req
    if (proxy.api_key && proxy.supplier) {
      return await this.rotateService.rotatingProxy(proxy, { log: options.log, waitUntilChangeIp: true, getNewIp: true }) as string;
    }
    //for auto rotating
    const { last_ip } = proxy
    let currentIp: string;
    do {
      currentIp = await this.getCurrentIp(this.mapperService.mapToEntity(proxy), { log: false, update: false });
      if (!currentIp) return;
      await sleep(2)
    } while (currentIp != last_ip)
    if (options.log) this.logger.log(`Rotating proxy ${proxy.ip}:${proxy.port} have been changed ip, current ip: ${currentIp}`);
    const TIME_AFTER_ROTATE = 20;
    this.logger.verbose(`Proxy ${proxy.ip}:${[proxy.port]} - Waiting ${TIME_AFTER_ROTATE}s after rotating for avoiding errors`);
    await sleep(TIME_AFTER_ROTATE);
    return currentIp;
  }

  //#region  crud
  async findOne(id: number): Promise<RotatingProxyIpv4DTO> {
    const proxy = await this.proxyRepository.findOneBy({ id })
    return new RotatingProxyIpv4DTO(proxy);
  }

  async findAll(options: { status?: 'live' | 'die' } = {}): Promise<RotatingProxyIpv4DTO[]> {
    let proxies: RotatingProxyIpv4[] = []
    if (!options.status) {
      proxies = await this.proxyRepository.find()
    } else {
      proxies = await this.proxyRepository.findBy({ status: options.status })
    }
    return proxies.map(proxy => new RotatingProxyIpv4DTO(proxy));
  }

  async create(createProxyDTO: CreateProxyDTO): Promise<RotatingProxyIpv4DTO> {
    const { ip, port } = createProxyDTO.proxy;
    let currentIp: string = await this.getCurrentIp({ ip, port }, { update: false })
    let proxy: RotatingProxyIpv4 = {
      ip,
      port,
      api_key: createProxyDTO.api_key,
      supplier: createProxyDTO.supplier,
      // country_code: await this.checkProxyGeolocation(ip),
      status: currentIp ? 'live' : 'die',
      last_ip: currentIp ?? undefined,
      last_checked: new Date(),
    };
    return new RotatingProxyIpv4DTO(await this.proxyRepository.save(proxy));
  }

  async remove(id: number): Promise<void> {
    this.proxyRepository.delete(id);
  }
  //#endregion
}
