import { Module } from '@nestjs/common';
import { InsScraperService } from '.';

@Module({
    exports: [
        InsScraperService
    ]
})
export class ScraperModule {}
