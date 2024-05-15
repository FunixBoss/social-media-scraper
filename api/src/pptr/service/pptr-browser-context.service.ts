import { Injectable } from "@nestjs/common";
import { Browser, BrowserContext, BrowserContextOptions, Page } from "puppeteer";
import { PptrPageService } from "./pptr-page.service";
import ProxyDTO from "src/proxy/dto/proxy.dto";

@Injectable()
export class PptrBrowserContextService {

    constructor(private pageService: PptrPageService) { }

    async setUpContext(context: BrowserContext, options: {
        numberOfPages?: number,
        urls?: string[],
        proxy?: ProxyDTO,
        cookiePaths?: string[],
        closeFirstPage?: boolean
    } = { numberOfPages: 1, closeFirstPage: false }): Promise<void> {
        if (options.closeFirstPage) await this.pageService.closeFirstPage(context);

        let promises: Promise<any>[] = []
        for (let i = 0; i < options.numberOfPages; i++) {
            promises.push(this.pageService.setupPage(context, {
                page: (await context.pages()).at(i),
                cookiePath: options.cookiePaths[i],
                url: options.urls[i],
                proxy: options.proxy
            }))
        }
        await Promise.all(promises) 
        console.log(`page length: ${(await context.pages()).length}`);
        
    }

    async createBrowserContexts(browser: Browser, options: { numberOfContexts?: number, proxy?: ProxyDTO } = { numberOfContexts: 1 }): Promise<BrowserContext[]> {
        try {
            const contextsPromises = [];
            for (let i = 0; i < options.numberOfContexts; i++) {
                contextsPromises.push(this.createBrowserContext(browser, { proxy: options.proxy }));
            }
            return await Promise.all(contextsPromises);
        } catch (error) {
            console.error('Error creating contexts:', error);
            throw error;
        }
    }

    async createBrowserContext(browser: Browser, options: { proxy?: ProxyDTO } = {}): Promise<BrowserContext> {
        const opts: BrowserContextOptions = {
            proxyServer: options.proxy ? `http://${options.proxy.ip}:${options.proxy.port}` : undefined,
        };
        const context = await browser.createBrowserContext(opts);
        console.log(`Successfully created context${options.proxy ? ` with proxy ${options.proxy.ip}:${options.proxy.port}` : ''}.`);
        return context;
    }
}
