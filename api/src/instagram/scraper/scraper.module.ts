import { Module } from '@nestjs/common';
import { InsScraperService, insScraperServiceFactory } from '.';
import { CookieHandler } from 'src/helper/CookieHandler';
import { HelperModule } from 'src/helper/helper.module';

@Module({
    imports: [HelperModule],
    providers: [
        {
            provide: 'IgCookie',
            useFactory: (cookieHandler: CookieHandler) => {
                return JSON.stringify(cookieHandler.getAsObj('instagram', '0.json'))
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


