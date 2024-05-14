import { Injectable } from "@nestjs/common";
import { Browser, BrowserContext, BrowserContextOptions } from "puppeteer";
import ProxyDTO from "src/proxy/dto/proxy.dto";

@Injectable()
export class PptrBrowserContextConfigService {
    async createBrowserContexts(browser: Browser, options: { numberOfContexts?: number, proxy?: ProxyDTO } = { numberOfContexts: 1 }): Promise<BrowserContext[]> {
        try {
            const contextsPromises = [];
            for (let i = 0; i < options.numberOfContexts; i++) {
                contextsPromises.push(this.createBrowserContext(browser, options.proxy));
            }
            return await Promise.all(contextsPromises);
        } catch (error) {
            console.error('Error creating contexts:', error);
            throw error;
        }
    }

    async createBrowserContext(browser: Browser, proxy?: ProxyDTO): Promise<BrowserContext> {
        const options: BrowserContextOptions = {
            proxyServer: proxy ? `http://${proxy.ip}:${proxy.port}` : undefined,
        };
        const context = await browser.createBrowserContext(options);
        console.log(`Successfully created context${proxy ? ` with proxy ${proxy.ip}:${proxy.port}` : ''}.`);
        await context.newPage();
        return context;
    }
}
