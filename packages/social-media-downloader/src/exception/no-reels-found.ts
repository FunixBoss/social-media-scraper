import { HttpException } from "@nestjs/common";

export class NoReelsFound extends HttpException {
    constructor(username: string) {
        super(`${username} did not fetch reels yet`, 400);
    }
}