import { Injectable, OnModuleInit } from "@nestjs/common";
import { Browser } from "puppeteer";
import PptrBrowserConfigService from "./pptr-browser-config.service";
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra'
import { PptrBrowserContextConfigService } from "./pptr-browser-context-config.service";
import { BROWSERSCAN_URL, INS_URL } from "../config/social-media.config";
import { PptrPageConfigService } from "./pptr-page-config.service";
import { ProxyService } from "src/proxy/proxy.service";
import ProxyDTO from "src/proxy/dto/proxy.dto";
import { sleep } from "../utils/Utils";
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const BlockResourcesPlugin = require('puppeteer-extra-plugin-block-resources');

const plugins: PuppeteerExtraPlugin[] = [
    StealthPlugin(),
    AnonymizeUAPlugin(),
    BlockResourcesPlugin({
        blockedTypes: new Set([
            'image',
            'media',
            // 'stylesheet', 
            'font',
            'texttrack',
            'eventsource',
            'websocket',
            'manifest',
            // 'other'
        ]),
    })
]
@Injectable()
export class PptrBrowserManagement implements OnModuleInit {
    private isInitialized = false;
    private browserMap: Map<string, Browser> = new Map()

    constructor(
        private readonly browserConfigService: PptrBrowserConfigService,
        private readonly contextConfigService: PptrBrowserContextConfigService,
        private readonly pageConfigService: PptrPageConfigService,
        private readonly proxyService: ProxyService
    ) {
    }

    async onModuleInit(): Promise<void>  {
        console.log('PptrBrowserManagement onModuleInit');
        await this.initializeBrowsers();
        await sleep(5)
    }

    async initializeBrowsers(): Promise<void> {
        try {
            this.setUpPlugin();
            await this.setUpInstagramBrowser();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error initializing browsers:', error);
        }
    }

    ensureInitialized() {
        return new Promise<void>((resolve) => {
            const checkInitialization = () => {
                if (this.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };
            checkInitialization();
        });
    }

    async setUpInstagramBrowser(): Promise<void> {
        const proxies: ProxyDTO[] = await this.proxyService.findAll();
        const browser = await this.createBrowser({ browserName: 'instagram', proxy: undefined });
        await this.contextConfigService.createBrowserContexts(browser, { numberOfContexts: 1, proxy: undefined })

        let promises: Promise<any>[] = []
        for (const context of browser.browserContexts()) {
            for (const [index, page] of (await context.pages()).entries()) { 
                const normalCookiesPaths = './uploads/cookies/instagram/default.json'
                const incognitoCookiesPaths = './uploads/cookies/instagram/incognito.json'
                promises.push(this.pageConfigService.setupPage(
                    context, 
                    {
                        page,
                        cookiePath: context.isIncognito() ? incognitoCookiesPaths : normalCookiesPaths,
                        url: BROWSERSCAN_URL,
                        proxy: proxies[index]
                    }
                ))
            }
        }
        await Promise.all(promises)
    }

    setUpPlugin() {
        for (const plugin of plugins) puppeteer.use(plugin);
    }

    getBrowser(browserName: string): Browser {
        
        return this.browserMap.get(browserName)
    }

    async createBrowser(options: { browserName?: string, proxy?: ProxyDTO } = {}): Promise<Browser> {
        const browser = await puppeteer.launch(this.browserConfigService.getConfig({ proxy: options.proxy }))
        if (options.browserName) {
            this.browserMap.set(options.browserName, browser)
        }
        return browser;
    }

    async closeBrowser(browserName: string): Promise<void> {
        this.browserMap.delete(browserName)
        await this.browserMap.get(browserName).close()
    }
}