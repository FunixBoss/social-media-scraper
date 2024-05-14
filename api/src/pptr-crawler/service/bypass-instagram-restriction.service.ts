import { Injectable, Logger } from "@nestjs/common";
import { ElementHandle, Page } from "puppeteer";

/*
    restriction cases:
    1. captcha solving
    2. We suspect automated behavior on your account
    3. Something went wrong There's an issue and the page could not be loaded.
*/

export type RestrictionType = 'CAPTCHA'
    | 'AUTOMATED_BEHAVIOR'
    | 'REQUIRE_RELOAD'

@Injectable()
export default class BypassInstagramRestrictionService {
    private readonly logger = new Logger(BypassInstagramRestrictionService.name);

    async bypass(page: Page): Promise<void> {
        page.on('framenavigated', async frame => {  // Mark this function as async
            if (!(frame.url().includes("https://www.instagram.com/challenge"))) return;
            await page.waitForNavigation({ waitUntil: "networkidle0" })

            const restrict = await this.getKindOfRestriction(page);
            this.logger.warn(`GOT INSTAGRAM RESTRICTION: ${restrict}`)
            switch (restrict) {
                case 'CAPTCHA': {
                    // Handle CAPTCHA
                    break;
                }
                case 'AUTOMATED_BEHAVIOR': {
                    this.bypassAutomatedBehavior(page);
                    break;
                }
                case "REQUIRE_RELOAD": {
                    // Handle requirement to reload 
                    break;
                }
            }
        });
    }

    private async getKindOfRestriction(page: Page): Promise<RestrictionType> {
        let restrictionType: RestrictionType = "CAPTCHA";
        try {
            const isAutomated: boolean = await page.$eval(
                "span[data-bloks-name='bk.components.Text']",
                (span: HTMLSpanElement) => span.innerText.includes("automated")
            )
            if (isAutomated) restrictionType = "AUTOMATED_BEHAVIOR"

            restrictionType = await page.$$eval(
                `span`,
                (spans: HTMLSpanElement[]) => {
                    for(const span of spans) {
                        if(span.innerText.includes("Something went wrong")) return "CAPTCHA" as RestrictionType;
                    }
                })
        } catch (error) {
            console.log(error["name"]);
        }
        return restrictionType;
    }

    private async bypassCaptchaSolving() {

    }

    private async bypassAutomatedBehavior(page: Page): Promise<void> {
        page.evaluate(`
            document.querySelectorAll("span[data-bloks-name='bk.components.TextSpan']")[3].click()
        `)
    }

    private async bypassRequireReload() {

    }
}