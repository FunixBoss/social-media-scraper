import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { ScraperController } from './scraper.controller';
import { InsScraperServiceFactory } from './service/ins-scraper-factory';
import ScraperService from './service/scraper.service';
import { ProxyModule } from 'src/proxy/proxy.module';

@Module({
    imports: [
        ProxyModule,
        HelperModule
    ],
    providers: [
        ScraperService,
        InsScraperServiceFactory,
    ],
    controllers: [
        ScraperController
    ],
    exports: [
        ScraperService,
        InsScraperServiceFactory
    ]
})
export class ScraperModule { }


