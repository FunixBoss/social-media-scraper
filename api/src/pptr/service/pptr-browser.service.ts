import { Injectable, Logger } from "@nestjs/common";
import { PptrPageService } from "./pptr-page.service";
import { PptrBrowserContextService } from "./pptr-browser-context.service";
import { InjectBrowser } from "nestjs-puppeteer";
import { Browser } from "puppeteer";
import { INS_URL } from "../config/social-media.config";
import { ProxyService } from "src/proxy/proxy.service";

@Injectable()
export class PptrBrowserService {
    private readonly logger = new Logger(PptrBrowserService.name);

    constructor(
        @InjectBrowser('social-media-scraper') private readonly defaultBrowser: Browser,
        @InjectBrowser('instagram-login') private readonly instaBrowser: Browser,
        private contextService: PptrBrowserContextService,
        private pageService: PptrPageService,
        private proxyService: ProxyService
    ) {
        this.setupPptr(); 
    }

    async setupPptr() {
        const normalCookiesPaths = ['./uploads/cookies/instagram/default.json']
        const incognitoCookiesPaths = ['./uploads/cookies/instagram/incognito.json']

        Promise.all([
            this.contextService.setUpContext(this.defaultBrowser.defaultBrowserContext(), {
                closeFirstPage: true,
                numberOfPages: 1,
                urls: [INS_URL],
                cookiePaths: normalCookiesPaths
            }),
            this.contextService.setUpContext(this.instaBrowser.defaultBrowserContext(), {
                closeFirstPage: true,
                numberOfPages: 1,
                urls: [INS_URL],
                cookiePaths: incognitoCookiesPaths
            })
        ]).then(() => {
            this.logger.log("Set up pptr successfully")
        })


        this.logger.log("Setup Puppeteer Successfully")
    }


}