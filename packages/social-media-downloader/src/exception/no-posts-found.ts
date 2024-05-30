import { HttpException } from "@nestjs/common";

export class NoPostsFound extends HttpException {
    constructor(username: string) {
        super(`${username} did not fetch posts yet`, 400);
    }
}