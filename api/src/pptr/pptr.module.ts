/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { PptrPageConfigService } from './service/pptr-page-config.service';
import BypassInstagramRestrictionService from './service/bypass-instagram-restriction.service';
import PptrBrowserConfigService from './service/pptr-browser-config.service';
import { PptrBrowserManagement } from './service/pptr-browser-management.service';
import { PptrBrowserContextConfigService } from './service/pptr-browser-context-config.service';
import { ProxyModule } from 'src/proxy/proxy.module';
@Module({
    imports: [
        ProxyModule
    ],
    providers: [
        PptrBrowserManagement,
        PptrBrowserConfigService,
        PptrBrowserContextConfigService,
        PptrPageConfigService,
        BypassInstagramRestrictionService,
    ],
    exports: [
        BypassInstagramRestrictionService,
        PptrBrowserManagement,
        PptrBrowserConfigService,
        PptrBrowserContextConfigService,
        PptrPageConfigService,
    ]
})
export class PptrModule { 
    constructor() {
        console.log('PptrModule initialized');
    }
}
