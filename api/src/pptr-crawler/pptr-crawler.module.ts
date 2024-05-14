/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { PptrBrowserConfig } from './service/pptr-browser-config.service';
import { PptrPageConfig } from './service/pptr-page-config.service';
import { PuppeteerModule } from 'nestjs-puppeteer';
import BypassInstagramRestrictionService from './service/bypass-instagram-restriction.service';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const BlockResourcesPlugin = require('puppeteer-extra-plugin-block-resources');

@Module({

    imports: [
        PuppeteerModule.forRoot({
            plugins: [
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
                }),
            ],
        }),
        
        PuppeteerModule.forRootAsync({
            name: 'social-media-scraper',
            isGlobal: true,
            useClass: PptrBrowserConfig,
        }),
        PuppeteerModule.forFeature(['instagram'], 'social-media-scraper'),
    ],
    providers: [
        PptrPageConfig,
        PptrBrowserConfig,
        BypassInstagramRestrictionService
    ],
    exports: [
        PuppeteerModule,
        BypassInstagramRestrictionService,
        PptrPageConfig,
        PptrBrowserConfig,
    ]
})
export class PptrCrawlerModule { }
