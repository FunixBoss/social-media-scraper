import { Injectable, Logger } from "@nestjs/common";
import { BrowserContext, Page, Protocol } from "puppeteer";
import { readFileSync } from 'fs';
import BypassInstagramRestrictionService from "./bypass-instagram-restriction.service";
import ProxyDTO from "src/proxy/proxy-ipv4/dto/proxy.dto";

@Injectable()
export class PptrPageService {
    private readonly logger = new Logger(PptrPageService.name);

    readonly DEFAULT_TIMEOUT = process.env.DEFAULT_TIMEOUT;
    readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    readonly DEFAULT_HTTP_HEADERS = { 'Accept-Language': 'en-US,en;q=0.9' }

    constructor(
        private readonly instaBypassService: BypassInstagramRestrictionService
    ) { }

    async createPages(context: BrowserContext, opts: {
        number: number,
        url?: string,
        cookiePath?: string,
        proxy?: ProxyDTO
    } = { number: 1 }): Promise<void> {
        console.log(`create Pages - create ${opts.number} pages`);
        let promises: Promise<any>[] = []
        for (let i = 0; i < opts.number; i++) {
            promises.push(this.setupPage(context, { cookiePath: opts.cookiePath, url: opts.url, proxy: opts.proxy }))
        }
        await Promise.all(promises)
    }

    async setupPage(context: BrowserContext, opts: {
        page?: Page,
        cookiePath?: string,
        url?: string,
        proxy?: ProxyDTO
    } = {}): Promise<Page> {
        if (!opts.page) opts.page = await context.newPage();

        opts.page.setDefaultTimeout(+this.DEFAULT_TIMEOUT);
        await opts.page.setExtraHTTPHeaders(this.DEFAULT_HTTP_HEADERS);
        await opts.page.setUserAgent(this.DEFAULT_USER_AGENT);
        await opts.page.setJavaScriptEnabled(true);
        await this.instaBypassService.bypass(opts.page);
        if (opts.cookiePath != null) {
            try {
                const cookiesJSON = readFileSync(opts.cookiePath, 'utf-8');
                const cookies: Protocol.Network.CookieParam[] = JSON.parse(cookiesJSON);
                await opts.page.setCookie(...cookies);
            } catch (error) {
                console.error('Error reading or parsing cookies file:', error);
            }
        }
        if (opts.proxy) {
            const { username, password } = opts.proxy
            await opts.page.authenticate({ username, password })
        }
        if (opts.url) {
            await opts.page.goto(opts.url, { waitUntil: 'load' })
        }
        return opts.page;
    }

    async closePage(context: BrowserContext, index: number = 0): Promise<void> {
        const pages = await context.pages()
        if (pages.length > 0) {
            await (pages[index].close());
        } else {
            console.log('No pages to close.');
        }
    }

    async closeFirstPage(context: BrowserContext): Promise<void> {
        return this.closePage(context, 0)
    }

    async closeLastPage(context: BrowserContext) {
        return this.closePage(context, (await context.pages()).length - 1)
    }

}