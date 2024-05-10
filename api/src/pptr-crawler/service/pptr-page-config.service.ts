import { Injectable, Logger } from "@nestjs/common";
import { Browser, BrowserContext, Credentials, Page, Protocol } from "puppeteer";
import { InjectBrowser } from 'nestjs-puppeteer';
import { FB_URL, INS_URL, THREADS_URL } from "../config/social-media.config";
import { readFileSync } from 'fs';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PptrPageConfig {
    proxy: string[] = []
    proxyIncognito: string[] = []
    private readonly logger = new Logger(PptrPageConfig.name);

    readonly DEFAULT_TIMEOUT = process.env.DEFAULT_TIMEOUT;
    readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    readonly DEFAULT_PAGE_SIZE = { width: 1920, height: 1080 }
    readonly DEFAULT_HTTP_HEADERS = { 'Accept-Language': 'en-US,en;q=0.9' }

    constructor(
        @InjectBrowser('social-media-scraper') private readonly browser: Browser,
        private readonly configService: ConfigService) {
        this.proxy = this.configService.get<string>("PROXY").split(":")
        this.proxyIncognito = this.configService.get<string>("PROXY_INCOGNITO").split(":")

        this.setupPptr(1);
    }

    async setupPptr(numberOfContexts: number) {
        await this.setUpBrowserContexts(numberOfContexts);
        await this.setupDefaultPages()
        this.logger.log("Setup Puppeteer Successfully")
    }

    async setUpBrowserContexts(numberOfContexts: number): Promise<void> {
        try {
            for (let i = 0; i < numberOfContexts; i++) {
                const context = await this.browser.createIncognitoBrowserContext({ proxyServer: `http://${this.proxyIncognito[0]}:${this.proxyIncognito[1]}` });
                await context.newPage()
            }
            console.log(`Successfully created ${numberOfContexts} incognito contexts.`);
        } catch (error) {
            console.error('Error creating incognito contexts:', error);
        }
    }

    async setupDefaultPages(): Promise<void> {
        let promises: Promise<any>[] = []
        await this.closeFirstPage()
        for (const context of this.browser.browserContexts()) {
            let pages: Page[] = await context.pages();
            console.log(`isIncognito: ${context.isIncognito()} - pages: ${pages.length}`);
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const redirectUrls = [INS_URL, FB_URL, THREADS_URL];
                const normalCookiesPaths = ['./uploads/cookies/instagram/default.json', null, null]
                const incognitoCookiesPaths = ['./uploads/cookies/instagram/incognito.json', null, null]
                const credentials = context.isIncognito()
                    ? { username: this.proxy[2], password: this.proxy[3] }
                    : { username: this.proxyIncognito[2], password: this.proxyIncognito[3] }
                promises.push(this.setupPage(
                    context,
                    page,
                    context.isIncognito() ? incognitoCookiesPaths[i] : normalCookiesPaths[i],
                    redirectUrls[i],
                    credentials
                ))
            }
        }
        await Promise.all(promises)
    }

    async createPages(context: BrowserContext, number: number, url?: string, cookiePath?: string, credentials?: Credentials): Promise<void> {
        console.log(`create Pages (in context incognito ${context.isIncognito()}) - create ${number} pages`);
        let promises: Promise<any>[] = []
        for (let i = 0; i < number; i++) {
            promises.push(this.setupPage(context, undefined, cookiePath, url, credentials))
        }
        await Promise.all(promises)
    }

    async setupPage(context?: BrowserContext, page?: Page, cookiePath?: string, url?: string, credentials?: Credentials): Promise<void> {
        console.log(`setup Page: incognito: ${context.isIncognito()}`);
        if (!context) context = this.browser.defaultBrowserContext();
        if (!page) page = await context.newPage();

        await page.setDefaultTimeout(+this.DEFAULT_TIMEOUT);
        await page.setViewport(this.DEFAULT_PAGE_SIZE);
        await page.setExtraHTTPHeaders(this.DEFAULT_HTTP_HEADERS);
        await page.setUserAgent(this.DEFAULT_USER_AGENT);
        await page.setJavaScriptEnabled(true);
        if (cookiePath != null) {
            try {
                const cookiesJSON = readFileSync(cookiePath, 'utf-8');
                const cookies: Protocol.Network.CookieParam[] = JSON.parse(cookiesJSON);
                await page.setCookie(...cookies);
            } catch (error) {
                console.error('Error reading or parsing cookies file:', error);
            }
        }
        if (credentials) {
            await page.authenticate(credentials)
        }
        if (url) {
            await page.goto(url, { waitUntil: "domcontentloaded" })
            console.log(`context (isIncognito: ${context.isIncognito()}): arrived ${url}`);

        }
    }

    async closePage(index: number): Promise<void> {
        const pages = await this.browser.pages()
        await pages.at(index).close()
    }

    async closeFirstPage() {
        const pages = await this.browser.pages();
        if (pages.length > 0) {
            await pages[0].close();
        } else {
            console.log('No pages to close.');
        }
    }

    async closeLastPage() {
        const pages = await this.browser.pages();

        // Check if there is at least one page open
        if (pages.length > 0) {
            // Close the last page
            await pages[pages.length - 1].close();
        } else {
            console.log('No pages to close.');
        }
    }

    async getLastPage(): Promise<Page> {
        // Get all pages in the browser
        const pages = await this.browser.pages();

        // Check if there is at least one page open
        if (pages.length > 0) {
            // Return the last page
            return pages[pages.length - 1];
        } else {
            throw new Error('No pages available.');
        }
    }

}