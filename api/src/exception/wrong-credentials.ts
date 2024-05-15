import { HttpException, NotFoundException } from "@nestjs/common";

export class WrongCredentialsException extends HttpException {
    constructor(credentials: { username: string, password: string }) {
        super(`Wrong credentials username: ${credentials.username} - password: ${credentials.password}`, 400, {
            description: "Wrong Credentials"
        });
    }
}