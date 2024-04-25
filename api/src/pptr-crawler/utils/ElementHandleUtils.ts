import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { sleep } from './Utils';
import { WAITING_SELECTOR_TIMEOUT } from "./PuppeteerConst";

// these functions are created for using in manipulate elements which can appear
// in multi pages (like manipulating with headers, footers)

export async function removeAllowCookiesDialog(page: Page) {
    try {
        const popup = await page.waitForSelector("#coiOverlay", { timeout: 5000 })
        if (popup) {
            popup.evaluate((e: Element) => e.remove())
        }
        sleep(1)
    } catch (error) {
        console.log("Error at PageUtils#removeAlowsCookiesDialog", error);
    }
}

export async function allowAllCookies(page: Page) {
    try {
        const allowBtn = await page.waitForSelector("button[aria-label='Allow all']", { timeout: WAITING_SELECTOR_TIMEOUT })
        if (allowBtn) {
            allowBtn.click()
        }
    } catch (error) {
        console.log("Error at PageUtils#allowAllCookies", error)
    }
}

export async function takeAndSendScreenShot(page: Page, description?: string) {
    const screenshot: Buffer = await page.screenshot({ path: `store/${Date.now()}.jpg`, fullPage: true });
    // TeleBotService.getInstance().sendPhoto(screenshot, description)
}

export async function isElementExist(handlder: ElementHandle<Element>, selector: string): Promise<boolean> {
    try {
        return await handlder.$(selector) !== null;
    } catch (error) {
        console.log(`selector does not exists: ${selector}`);
        return false;
    }
}

export async function getElementInnerText(handler: ElementHandle<Element>, selector?: string, defaultValue = ""): Promise<string> {
    try {
        if (selector) {
            return await handler.$eval(selector, (node: HTMLElement) => node.innerText);
        } else {
            return await handler.evaluate((node: HTMLElement) => node.innerText)
        }
    } catch (error) {
        console.log('getElementInnerText error===>', error);
        return defaultValue;
    }
}

export async function inputCopy(page: Page, selector: string, text: string): Promise<void> {
    await page.$eval(selector, (el: HTMLInputElement, text) => {
        el.value = text.slice(0, text.length - 1);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }, text);
    await page.type(selector, text.substr(-1))
}

export async function scrollToBottom(page: Page) {
    await page.evaluate(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollTo({
            top: scrollHeight,
            behavior: 'smooth',
        });
        setTimeout(
            () => {
                window.scrollTo({
                    top: scrollHeight - 500,
                    behavior: 'smooth',
                });
            }, 2000
        )
    });
}

export async function clickImNotRobot(page: Page) {
    // await page.solveRecaptchas()
    // console.log("Solved captcha complete");

    const btn = await page.waitForSelector("#recaptcha-anchor", { timeout: 20000 })
    await btn.click()
    await sleep(2)
}