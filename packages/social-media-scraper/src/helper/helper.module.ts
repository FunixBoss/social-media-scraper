import { Module } from '@nestjs/common';
import { CookieHandler } from './CookieHandler';

@Module({
    providers: [CookieHandler],
    exports: [CookieHandler]
})
export class HelperModule {}
