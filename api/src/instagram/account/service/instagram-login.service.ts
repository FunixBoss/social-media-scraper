import { Injectable } from "@nestjs/common";
<<<<<<< HEAD
import axios, { AxiosProxyConfig } from "axios";
import { ElementHandle, Page } from "puppeteer";
import { WrongCredentialsException } from "src/exception/wrong-credentials";
import { WrongTwoFactorAuthenticationException } from "src/exception/wrong-two-factor-authentication";
import { Proxy } from "src/proxy/entity/proxy.entity";
import { sleep } from "src/pptr/utils/Utils";
import { PptrBrowserManagement } from '../../../pptr/service/pptr-browser-management.service';
import { PptrPageConfigService } from "src/pptr/service/pptr-page-config.service";
import { ProxyService } from "src/proxy/proxy.service";
import ProxyDTO from "src/proxy/dto/proxy.dto";
=======
>>>>>>> parent of ba779404 (add extensions. instagram login, detect restrictions, improve scraper)

@Injectable()
export default class InstagramLoginService {
    constructor(
<<<<<<< HEAD
        private readonly browserManagement: PptrBrowserManagement,
        private readonly pageConfig: PptrPageConfigService,
        private readonly proxyService: ProxyService
    ) {

    }

    async login(credentials: { username: string, password: string, twoFA?: string }): Promise<boolean> {
        const LOGIN_URL = "https://www.instagram.com";
        const proxy: ProxyDTO = await this.proxyService.getRandom();
        const browser = await this.browserManagement.createBrowser({ browserName: 'insta-login', proxy });
        const context = browser.defaultBrowserContext();
        const page: Page = await this.pageConfig.setupPage(context, {
            page: (await context.pages()).at(0),
            url: LOGIN_URL,
            proxy
        })

        const usernameHandler: ElementHandle<HTMLInputElement> = await page.waitForSelector("input[name='username']", { timeout: 5000 });
        await usernameHandler.type(credentials.username, { delay: 100 })
        await page.type("input[name='password'", credentials.password, { delay: 120 });
        await page.click("button[type='submit']", { delay: 100 })
        if (!await this.isRightCredentials(page)) throw new WrongCredentialsException(credentials)

        await page.waitForNavigation({ waitUntil: "networkidle2" })
        if (credentials.twoFA) {
            let twoFACode: TwoFACode = await this.get2FaCode(credentials.twoFA)
            if (twoFACode.lifetime <= 2) {
                await sleep(2)
                twoFACode = await this.get2FaCode(credentials.twoFA)
            }
            const verificationCodeHandler: ElementHandle<HTMLInputElement> = await page.waitForSelector("input[name='verificationCode']", { timeout: 5000 })
            verificationCodeHandler.type(twoFACode.code)
            await page.click("button[type='button']")
            if (!(await this.isPassed2Fa(page))) throw new WrongTwoFactorAuthenticationException({ twoFA: credentials.twoFA })

            await page.waitForNavigation({ waitUntil: "networkidle2" })
        }
        return page.url().includes("https://www.instagram.com/accounts");
    }

    private async isRightCredentials(page: Page): Promise<boolean> {
        return true;
    }

    private async isPassed2Fa(page: Page): Promise<boolean> {
        return true;
    }

    async get2FaCode(twoFa: string, px?: Proxy): Promise<TwoFACode> {
        let proxy: AxiosProxyConfig;
        if (px) {
            proxy = {
                host: px.ip,
                port: +px.port,
                auth: { username: px.username, password: px.password }
            }
        }
        let result;
        await axios.get(`https://api.code.pro.vn/2fa/v1/get-code?secretKey=${twoFa}`, {
            proxy: px ? proxy : false
        }).then((data) => {
            result = data.data;
        }).catch((error) => {
            console.log(error["name"])
        })
        return result;
    }
=======
    ) {

    }
>>>>>>> parent of ba779404 (add extensions. instagram login, detect restrictions, improve scraper)
}