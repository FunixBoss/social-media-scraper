<<<<<<< HEAD:api/src/pptr/service/pptr-browser-config.service.ts
import { Injectable } from "@nestjs/common";
import { Browser, PuppeteerLaunchOptions } from "puppeteer";
=======
import { Injectable, Logger } from "@nestjs/common";
>>>>>>> parent of ba779404 (add extensions. instagram login, detect restrictions, improve scraper):api/src/pptr-crawler/service/pptr-browser-config.service.ts
import { ConfigService } from "@nestjs/config";
import ProxyDTO from "src/proxy/dto/proxy.dto";

export const minimal_args = [
    '--disable-speech-api', // 	Disables the Web Speech API (both speech recognition and synthesis)
    '--disable-background-networking', // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
    '--disable-background-timer-throttling', // Disable task throttling of timer tasks from background pages. ↪
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];

@Injectable()
export default class PptrBrowserConfigService {

    static defaultBrowser: Browser;

<<<<<<< HEAD:api/src/pptr/service/pptr-browser-config.service.ts
    constructor(private readonly configService: ConfigService) { }

    getConfig(options: { proxy?: ProxyDTO } = {}): PuppeteerLaunchOptions {
        const EXTENSION_PATH = 'D:/ProgrammingLife/Tool/social-media-scraper/api/extensions';
        const AUTOCAPTCHAPRO = `${EXTENSION_PATH}/AutocaptchaProExtension`;
=======
    createPuppeteerOptions(): PuppeteerNodeLaunchOptions {
>>>>>>> parent of ba779404 (add extensions. instagram login, detect restrictions, improve scraper):api/src/pptr-crawler/service/pptr-browser-config.service.ts
        return {
            args: [
                ...minimal_args,
                '--enable-automation',
<<<<<<< HEAD:api/src/pptr/service/pptr-browser-config.service.ts
                `--load-extension=${AUTOCAPTCHAPRO}`,
                // this.proxy ? --proxy-server=http://${this.proxy[0]}:${this.proxy[1]} : '',
                `--disable-extensions-except=${AUTOCAPTCHAPRO}`,
=======
                this.proxy ? `--proxy-server=http://${this.proxy[0]}:${this.proxy[1]}` : '',
                ...minimal_args
>>>>>>> parent of ba779404 (add extensions. instagram login, detect restrictions, improve scraper):api/src/pptr-crawler/service/pptr-browser-config.service.ts
            ],
            headless: this.configService.get<string>("PUPPETEER_HEADLESS") == "new"
                ? "new"
                : this.configService.get<string>("PUPPETEER_HEADLESS") == "true",
            executablePath: this.configService.get<string>("EXECUTABLE_PATH"),
            userDataDir: this.configService.get<string>("PROFILE_PATH"),
            devtools: this.configService.get<string>("DEVTOOLS") == "true",
        };
    }
}