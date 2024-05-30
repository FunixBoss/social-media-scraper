import { ProxyIpv4 } from 'src/proxy/entity/proxy-ipv4.entity';
import { moment } from 'src/main';

export default class ProxyIpv4DTO {
    constructor(proxy: ProxyIpv4) {
        this.id = proxy.id
        this.ip = proxy.ip
        this.port = proxy.port
        this.username = proxy.username
        this.password = proxy.password
        this.country_code = proxy.country_code
        this.status = proxy.status
        this.import_date = moment(proxy.import_date).tz('Asia/Ho_Chi_Minh').toISOString()
        this.expiration_date = moment(proxy.expiration_date).tz('Asia/Ho_Chi_Minh').toISOString()
        this.last_checked = moment(proxy.last_checked).tz('Asia/Ho_Chi_Minh').toISOString()
        this.last_used = moment(proxy.last_used).tz('Asia/Ho_Chi_Minh').toISOString()
    }

    id?: number;
    ip?: string;
    port?: number;
    username?: string;
    password?: string;
    country_code?: string;
    status?: 'live' | 'die' | 'out_of_date';
    import_date?: string;
    expiration_date?: string;
    last_checked?: string;
    last_used?: string;
}
