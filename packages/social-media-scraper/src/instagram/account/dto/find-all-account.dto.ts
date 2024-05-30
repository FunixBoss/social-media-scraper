import { InstagramAccount } from "src/instagram/entity/instagram-account.entity";

export class InstagramAccountDTO {

    constructor(account: InstagramAccount) {
        this.id = account.id;
        this.username = account.username;
        this.password = account.password;
        this.twoFactorAuthentication = account.twoFactorAuthentication;
        this.cookie_string = account.cookie_string;
        this.mail = account.mail;
        this.status = account.status;
        this.import_date = account.import_date;
        this.last_checked = account.last_checked;
        this.last_used = account.last_used;
    }

    id?: number;
    username?: string;
    password?: string;
    twoFactorAuthentication?: string;
    cookie_string?: string;
    mail?: string;
    status?: 'live' | 'ban' | 'restrict';
    import_date?: Date;
    last_checked?: Date;
    last_used?: Date;
}