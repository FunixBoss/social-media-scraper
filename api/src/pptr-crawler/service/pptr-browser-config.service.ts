import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PuppeteerOptionsFactory } from "nestjs-puppeteer";
import { PuppeteerNodeLaunchOptions } from "puppeteer";

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

    proxy: string[]
    constructor(private readonly configService: ConfigService) {
        console.log(this.configService.get<boolean>("PUPPETEER_HEADLESS"))
        this.proxy = this.configService.get<string>("PROXY").split(":")
    }

    createPuppeteerOptions(): PuppeteerNodeLaunchOptions {
        const EXTENSION_PATH = 'D:/ProgrammingLife/Tool/social-media-scraper/api/extensions';
        const AUTOCAPTCHAPRO = `${EXTENSION_PATH}/AutocaptchaProExtension`
        return {
            args: [
                '--enable-automation',
                `--load-extension=${AUTOCAPTCHAPRO}`,
                `--disable-extensions-except=${AUTOCAPTCHAPRO}`, 
                this.proxy ? `--proxy-server=http://${this.proxy[0]}:${this.proxy[1]}` : '',
                ...minimal_args
            ],
            headless: this.configService.get<string>("PUPPETEER_HEADLESS") == "shell"
                ? "shell"
                : this.configService.get<string>("PUPPETEER_HEADLESS") == "true",
            // executablePath: this.configService.get<string>("EXECUTABLE_PATH"),
            // userDataDir: this.configService.get<string>("PROFILE_PATH"),
            // devtools: this.configService.get<string>("DEVTOOLS") == "true",
            pipe: true
        };
    }
}