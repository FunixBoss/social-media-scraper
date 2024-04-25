import { Injectable } from "@nestjs/common";
import { Browser, Page } from "puppeteer";
import { InjectBrowser, InjectPage } from 'nestjs-puppeteer';

@Injectable()
export class InsCrawlerService {

    constructor(@InjectPage('instagram', 'social-media-scraper') private readonly instagramPage: Page) {
    }

    async goto(url: string): Promise<void>  {
        await this.instagramPage.goto(url);
    }


}