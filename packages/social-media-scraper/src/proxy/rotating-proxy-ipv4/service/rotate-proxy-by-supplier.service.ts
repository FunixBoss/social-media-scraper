import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import RotatingProxyIpv4DTO from "../dto/proxy.dto";
import axios from "axios";
import { sleep } from "src/pptr/utils/Utils";
import { RotatingProxyIpv4Service } from './rotating-proxy-ipv4.service';
import RotatingProxyIpv4MapperService from "./rotating-proxy-ipv4-mapper.service";
import { ConfigService } from "@nestjs/config";
import { ProxyConfig } from "src/config/crawl-settings.type";

type CloudVpsVietIpRotatingResponse = {
    Status: "success" | "error"
    Message: string;
}

type ProxyXoayIpRotatingResponse = {
    status: number,
    message: string,
    data: []
}

export type RotateProxyOptions = {
    waitUntilChangeIp?: boolean,
    getNewIp?: boolean,
    log?: boolean
}

@Injectable()
export default class RotateProxyBySupplierService {
    private readonly logger = new Logger(RotateProxyBySupplierService.name);
    private readonly proxyConfig: ProxyConfig;
    constructor(
        @Inject(forwardRef(() => RotatingProxyIpv4Service)) private readonly proxyService: RotatingProxyIpv4Service,
        private readonly mapperService: RotatingProxyIpv4MapperService,
        private readonly configService: ConfigService
    ) {
        this.proxyConfig = configService.get<ProxyConfig>('proxy')
    }

    async rotatingProxy(proxy: RotatingProxyIpv4DTO, options: RotateProxyOptions = {
        waitUntilChangeIp: false,
        getNewIp: false,
        log: false
    }): Promise<boolean | string> { 
        switch (proxy.supplier) {
            case "cloudvpsviet": {
                return await this.rotateCloudVpsViet(proxy, options);
            }
            case "proxyxoay": {
                return await this.rotateProxyXoay(proxy, options);
            }
        }
    }

    private async rotateProxyXoay(proxy: RotatingProxyIpv4DTO, options: RotateProxyOptions): Promise<boolean | string> {
        const API_URL = "https://proxyxoay.net/api/rotating-proxy/change-key-ip/"
        try {
            const response = await axios.get<ProxyXoayIpRotatingResponse>(`${API_URL}${proxy.api_key}`, { timeout: 15000 });
            if (response.data.status == 200) {
                if (options.log) this.logger.verbose(`Rotating ProxyXoay sucessfully: ${proxy.ip}:${proxy.port}`);
                const TIME_AFTER_ROTATE = 20
                this.logger.verbose(`Waiting ${TIME_AFTER_ROTATE}s after rotating for avoiding errors`);
                await sleep(TIME_AFTER_ROTATE);
                if (options.getNewIp) {
                    return await this.proxyService.getCurrentIp(this.mapperService.mapToEntity(proxy), { log: true, update: true })
                }
                return true;
            }
        } catch (error) {
            if (options.waitUntilChangeIp && error.response.status) {
                const waitingTimeToChangeIp: number = +error.response.data.message.match(/\d+/)[0];
                const bonusTime = 2
                if (options.log) this.logger.verbose(`Wait ${waitingTimeToChangeIp}s for next ip changing`)
                await sleep(waitingTimeToChangeIp + bonusTime)
                await this.rotateProxyXoay(proxy, options)
            } else {
                if (options.log) this.logger.error(`Rotating ProxyXoay failed: ${proxy.ip}:${proxy.port}. Error: ${error["name"]} - ${error["message"]}`);
            }
            return false;
        }
    }

    private async rotateCloudVpsViet(proxy: RotatingProxyIpv4DTO, options: RotateProxyOptions): Promise<boolean | string> {
        const API_URL = "https://api.m2proxy.com/user/package/changeip?package_api_key="
        try {
            const response = await axios.get<CloudVpsVietIpRotatingResponse>(`${API_URL}${proxy.api_key}`, { timeout: 15000 });
            if (response.data.Status == "success") {
                if (options.log) this.logger.verbose(`Rotate proxy ClouseVpsViet sucessfully: ${proxy.ip}:${proxy.port}`);
                this.logger.verbose(`Proxy ${proxy.ip}:${[proxy.port]} - Waiting ${this.proxyConfig.time_after_rotate}s after rotating for avoiding errors`);
                await sleep(this.proxyConfig.time_after_rotate);
                if (options.getNewIp) {
                    return await this.proxyService.getCurrentIp(this.mapperService.mapToEntity(proxy), { log: true, update: true })
                }
                return true;
            } else if (options.waitUntilChangeIp && response.data.Status == "error") {
                const waitingTimeToChangeIp: number = +response.data.Message.match(/\d+/)[0];
                const bonusTime = 2
                if (options.log) this.logger.verbose(`Proxy ${proxy.ip}:${proxy.port} - Wait ${waitingTimeToChangeIp}s to next ip changing`)
                await sleep(waitingTimeToChangeIp + bonusTime)
                await this.rotateCloudVpsViet(proxy, options)
            }
        } catch (error) {
            if (options.log) this.logger.error(`Rotating ClouseVpsViet failed: ${proxy.ip}:${proxy.port}. Error: ${error["name"]} - ${error["message"]}`);
            return false;
        }
    }
} 