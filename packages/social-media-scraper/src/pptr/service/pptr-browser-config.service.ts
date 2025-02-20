import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PuppeteerOptionsFactory } from "nestjs-puppeteer";
import { PuppeteerNodeLaunchOptions } from "puppeteer";
import { ProxyIpv4 } from "src/proxy/entity/proxy-ipv4.entity";
import { BROWSER_DIMENSIONS } from "../const/pptr-const";

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
export class PptrBrowserConfig implements PuppeteerOptionsFactory {

    constructor(
        private readonly profilePathName: string,
        private readonly configService: ConfigService,
        private readonly proxy?: ProxyIpv4,
    ) { }

    createPuppeteerOptions(): PuppeteerNodeLaunchOptions {
        const AUTOCAPTCHAPRO = `${this.configService.get<string>("EXTENSIONS_PATH")}/AutocaptchaProExtension`
        return {
            args: [
                '--enable-automation',
                `--load-extension=${AUTOCAPTCHAPRO}`,
                `--disable-extensions-except=${AUTOCAPTCHAPRO}`,
                `--window-size=${BROWSER_DIMENSIONS.width},${BROWSER_DIMENSIONS.height}`,
                `--window-position=0,0`,
                this.proxy ? `--proxy-server=http://${this.proxy.ip}:${this.proxy.port}` : '',
                ...minimal_args
            ],
            ignoreDefaultArgs: ['--enable-automation'],
            defaultViewport: {
                width: BROWSER_DIMENSIONS.width,
                height: BROWSER_DIMENSIONS.height,
                deviceScaleFactor: 0.1
            },
            headless: this.configService.get<string>("PUPPETEER_HEADLESS") == "shell"
                ? "shell"
                : this.configService.get<string>("PUPPETEER_HEADLESS") == "true",
            executablePath: this.configService.get<string>("EXECUTABLE_PATH"),
            userDataDir: `${this.configService.get<string>("PROFILE_PATH")}/${this.profilePathName}`,
            devtools: this.configService.get<string>("DEVTOOLS") == "true",
        };
    }
} 