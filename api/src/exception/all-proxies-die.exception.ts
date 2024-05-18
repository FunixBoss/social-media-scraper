import { HttpException } from "@nestjs/common";

export class AllProxiesDie extends HttpException {
    constructor() {
        super(`All proxies have been died, please renew it`, 500);
    }
}