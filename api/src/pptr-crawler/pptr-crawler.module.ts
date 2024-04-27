import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'nestjs-puppeteer';
import { PptrBrowserConfig } from './service/pptr-browser-config.service';
import { PptrPageConfig } from './service/pptr-page-config.service';
import { ConfigModule } from '@nestjs/config';
// const pluginProxy = require('puppeteer-extra-plugin-proxy');

@Module({
    providers: [
        PptrPageConfig,
        PptrBrowserConfig,
    ],
    imports: [
        PuppeteerModule.forRoot({
            plugins: [
                require('puppeteer-extra-plugin-stealth'),
                require('puppeteer-extra-plugin-anonymize-ua'),
            ]
        }),
        PuppeteerModule.forRootAsync({
            name: 'social-media-scraper',
            isGlobal: true,
            useClass: PptrBrowserConfig,
        }),
        PuppeteerModule.forFeature(['instagram'], 'social-media-scraper'),
    ],
    exports: [PuppeteerModule]
})
export class PptrCrawlerModule { }
