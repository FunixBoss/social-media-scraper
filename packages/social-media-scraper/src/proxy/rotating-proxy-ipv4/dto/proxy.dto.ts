import { moment } from 'src/main';
import { RotatingProxyIpv4 } from 'src/proxy/entity/rotating-proxy-ipv4.entity';

export default class RotatingProxyIpv4DTO {
    constructor(proxy: RotatingProxyIpv4) {
        this.id = proxy.id
        this.ip = proxy.ip
        this.port = proxy.port
        this.country_code = proxy.country_code
        this.status = proxy.status
        this.last_ip = proxy.last_ip
        this.last_checked = moment(proxy.last_checked).tz('Asia/Ho_Chi_Minh').toISOString()
        this.api_key = proxy.api_key
        this.supplier = proxy.supplier
    }

    id?: number;
    ip?: string;
    port?: number;
    country_code?: string;
    status?: 'live' | 'die';
    last_ip?: string
    last_checked?: string;
    api_key?: string;
    supplier?: string;
}
