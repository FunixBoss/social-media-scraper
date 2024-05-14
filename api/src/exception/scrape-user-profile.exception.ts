import { HttpException, NotFoundException } from "@nestjs/common";

export class ScrapeUserProfileFailed extends HttpException {
    constructor(username: string) {
        super(`Scrape User Profile: ${username} Failed`, 503, {
            description: "Scrape User Profile Error"
        });
    }
}