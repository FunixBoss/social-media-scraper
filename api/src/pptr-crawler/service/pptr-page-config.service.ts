import { Injectable } from "@nestjs/common";
import { Browser, Credentials, Page, Protocol } from "puppeteer";
import { InjectBrowser } from 'nestjs-puppeteer';
import { FB_URL, INS_URL, THREADS_URL } from "../config/social-media.config";
import { readFileSync } from "fs";

@Injectable()
export class PptrPageConfig {
    readonly DEFAULT_TIMEOUT = process.env.DEFAULT_TIMEOUT;
    readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    readonly DEFAULT_PAGE_SIZE = { width: 1920, height: 1080 }
    readonly DEFAULT_HTTP_HEADERS = { 'Accept-Language': 'en-US,en;q=0.9' }
    constructor(@InjectBrowser('social-media-scraper') private readonly browser: Browser) {
        this.setupDefaultPages();
    }

    async setupDefaultPages() {
        console.log("setup pages");
        await this.closeFirstPage()
        const pages = await this.browser.pages();
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const redirectUrls = [INS_URL, FB_URL, THREADS_URL];
            const cookiesPaths = ['./uploads/cookies/instagram/0.json', null, null]
            await this.setupPage(page, cookiesPaths[i], redirectUrls[i]
                , { username: 'eklbdtximj', password: 'mR1oHLz6IQa9' }
            )
        }
    }

    async createPages(number: number, url?: string, cookiePath?: string, credentials?: Credentials): Promise<void> {
        let promises: Promise<any>[]= []
        for (let i = 0; i < number; i++) {
            promises.push(this.setupPage(undefined, cookiePath, url, credentials))
        }
        await Promise.all(promises)
    }

    async setupPage(page?: Page, cookiePath?: string, url?: string, credentials?: Credentials): Promise<void> {
        if (!page) page = await this.browser.newPage();

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