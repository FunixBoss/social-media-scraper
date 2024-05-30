/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { PptrPageService } from './service/pptr-page.service';
import BypassInstagramRestrictionService from './service/bypass-instagram-restriction.service';
import { PptrBrowserContextService } from './service/pptr-browser-context.service';
import { PuppeteerModule } from 'nestjs-puppeteer';
import { PptrBrowserConfig } from './service/pptr-browser-config.service';
import { PptrBrowserService } from './service/pptr-browser.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProxyModule } from 'src/proxy/proxy.module';

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AnonymizeUAPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const BlockResourcesPlugin = require('puppeteer-extra-plugin-block-resources');
@Module({
    imports: [
        ProxyModule, 
        PuppeteerModule.forRoot({
            plugins: [
                StealthPlugin(),
                AnonymizeUAPlugin(),
                BlockResourcesPlugin({
                    blockedTypes: new Set([
                        'image',
                        'media',
                        'font',
                        'texttrack',
                        'eventsource',
                        'websocket',
                        'manifest',
                        // 'stylesheet', 
                        // 'other'
                    ]),
                }),
            ],
        }),
        PuppeteerModule.forRootAsync({
            name: 'social-media-scraper',
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                // const rPrx: RotatingProxy = {
                //     host: configService.get<string>("PROXY_ROTATING_HOST"),
                //     port: configService.get<number>("PROXY_ROTATING_PORT")
                // };
                
                const profilePathNameList: string[] = configService.get<string>("PROFILE_PATH_NAME_LIST").split(",")
                const pptrBrowserConfig = new PptrBrowserConfig(profilePathNameList[0], configService);
                return pptrBrowserConfig.createPuppeteerOptions();
            },
        }),
        // PuppeteerModule.forRootAsync({
        //     name: 'instagram-login',
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (configService: ConfigService) => {
        //         await sleep(3) // if many browser open as the same time -> cause ProtocolError
        //         // const rPrx: RotatingProxy = {
        //         //     host: configService.get<string>("PROXY_ROTATING_HOST"),
        //         //     port: 10006
        //         // };
        //         const profilePathNameList: string[] = configService.get<string>("PROFILE_PATH_NAME_LIST").split(",")

        //         const pptrBrowserConfig = new PptrBrowserConfig(profilePathNameList[1], configService);
        //         return pptrBrowserConfig.createPuppeteerOptions();
        //     },
        // }),
        PuppeteerModule.forFeature(['instagram'], 'social-media-scraper'),
    ],
    providers: [
        PptrBrowserService,
        PptrBrowserContextService,
        PptrPageService,
        BypassInstagramRestrictionService,
    ],
    exports: [
        PuppeteerModule,
        PptrBrowserService,
        BypassInstagramRestrictionService,
        PptrBrowserContextService,
        PptrPageService,
    ]
})
export class PptrModule { }
