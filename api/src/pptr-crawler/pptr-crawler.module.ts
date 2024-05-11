/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { PptrBrowserConfig } from './service/pptr-browser-config.service';
import { PptrPageConfig } from './service/pptr-page-config.service';
import { PuppeteerModule } from 'nestjs-puppeteer';
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');
const BlockResourcesPlugin = require('puppeteer-extra-plugin-block-resources');

@Module({
    providers: [
        PptrPageConfig,
        PptrBrowserConfig,
    ],
    imports: [
        PuppeteerModule.forRoot({
            plugins: [
                StealthPlugin(),
                AnonymizeUAPlugin(),
                UserPreferencesPlugin({
                    preferences: {
                        'intl.accept_languages': 'en-US,en;q=0.9', // Set default language
                        'geolocation.default': 'US', // Set default geolocation
                    },
                }),
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
        }),
        PuppeteerModule.forRootAsync({
            name: 'social-media-scraper',
            isGlobal: true,
            useClass: PptrBrowserConfig,
        }),
        PuppeteerModule.forFeature(['instagram'], 'social-media-scraper'),
    ],
    exports: [
        PuppeteerModule,
        PptrPageConfig,
        PptrBrowserConfig,
    ]
})
export class PptrCrawlerModule { }
