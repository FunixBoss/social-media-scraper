import { Injectable } from "@nestjs/common";
import axios, { AxiosProxyConfig } from "axios";
import { InjectBrowser, InjectPage } from "nestjs-puppeteer";
import { Browser, ElementHandle, Page } from "puppeteer";
import { WrongCredentialsException } from "src/exception/wrong-credentials";
import { WrongTwoFactorAuthenticationException } from "src/exception/wrong-two-factor-authentication";
import { PptrPageService } from "src/pptr/service/pptr-page.service";
import { PptrBrowserContextService } from "src/pptr/service/pptr-browser-context.service";
import { INS_URL } from "src/pptr/config/social-media.config";
import { sleep } from "src/pptr/utils/Utils";
import { Proxy } from "src/proxy/entity/proxy.entity";
import { ProxyService } from "src/proxy/proxy.service";
import ProxyDTO from "src/proxy/dto/proxy.dto";

export type TwoFACode = {
    code: string,
    lifetime: number
}
@Injectable()
export default class InstagramLoginService {

    constructor(
        @InjectBrowser('social-media-scraper') private readonly browser: Browser,
        @InjectPage('instagram', 'social-media-scraper') private readonly page: Page,
        private readonly pageService: PptrPageService,
        private readonly contextService: PptrBrowserContextService,
        private readonly proxyService: ProxyService
    ) {

    }

    async login(credentials: { username: string, password: string, twoFA?: string }): Promise<boolean> {
        const proxy: ProxyDTO = await this.proxyService.getRandom();
        let context = await this.contextService.createBrowserContext(this.browser, { proxy });
        const page: Page = await this.pageService.setupPage(context, {
            page: (await context.pages()).at(0),
            url: INS_URL,
            proxy
        });


        // have to check right username/password
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
}