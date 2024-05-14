import { Page, TimeoutError } from "puppeteer";
import { sleep } from "src/pptr/utils/Utils";

async function scrollInfinityToBottom(page: Page) {
    let previousHeight = await page.evaluate('document.body.scrollHeight');
    console.log("start scrolling");
    while (true) {
        const numberOfScrolls = 20;
        const scrollAmount = -150;
        const delayBetweenScrolls = 0.1;

        for (let i = 0; i < numberOfScrolls; i++) {
            await page.evaluate((scrollY) => window.scrollBy(0, scrollY), scrollAmount);
            await sleep(delayBetweenScrolls)
        }
        const numberOfIncrements = 20;
        const scrollHeight = (await page.evaluate(() => document.body.scrollHeight)) + 500;
        const scrollIncrement = Math.floor(scrollHeight / numberOfIncrements);

        for (let i = 0; i < numberOfIncrements; i++) {
            await page.evaluate((scrollIncrement) => {
                window.scrollBy(0, scrollIncrement);
            }, scrollIncrement);
            await sleep(delayBetweenScrolls)
        }

        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 2000 });
        let currentHeight = await page.evaluate('document.body.scrollHeight');

        if (previousHeight >= currentHeight) {
            throw new TimeoutError('');
        }
        previousHeight = currentHeight;
        console.log("scrolling done");

    }
}
