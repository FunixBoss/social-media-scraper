import { Module } from '@nestjs/common';
import { InsScraperService, insScraperServiceFactory } from '.';
import { CookieHandler } from 'src/helper/CookieHandler';
import { HelperModule } from 'src/helper/helper.module';
import { ProxyModule } from 'src/proxy/proxy.module';
@Module({
    imports: [
        ProxyModule,
        HelperModule
    ],
    providers: [
        {
            provide: 'IgCookie',
            useFactory: (cookieHandler: CookieHandler) => {
                return cookieHandler.getAsText('instagram', '0.json')
            },
            inject: [CookieHandler]
        },
        {
            provide: 'AxiosOpts',
            useValue: {}
        },
        insScraperServiceFactory,
    ],
    exports: [
        InsScraperService
    ]
})
export class ScraperModule { }


