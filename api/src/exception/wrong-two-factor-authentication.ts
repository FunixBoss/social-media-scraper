import { HttpException } from "@nestjs/common";

export class WrongTwoFactorAuthenticationException extends HttpException {
    constructor(credentials: { twoFA: string }) {
        super(`Wrong 2FA Code: ${credentials.twoFA}`, 400, {
            description: "Wrong 2FA Code"
        });
    }
}