import { WaitForOptions } from "puppeteer";

export const TYPING_TIME: number = 50;
export const WAITING_SELECTOR_TIMEOUT: number = 5000;
export const WAIT_FOR_OPTIONS: WaitForOptions = { waitUntil: 'networkidle0' }