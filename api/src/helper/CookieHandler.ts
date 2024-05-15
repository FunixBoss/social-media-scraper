import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

export type cookieType = "instagram" | "threads" | "facebook"

@Injectable()
export class CookieHandler {
	private readonly COOKIE_BASE_DIR: string = 'uploads/cookies';

	public save = (cookieType: cookieType, cookieName: string, cookie: string): void => {
		const cookieDir = `${this.COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		if (!fs.existsSync(cookieDir)) {
			fs.writeFileSync(cookieDir, cookie, 'utf-8');
		} else {
			this.update(cookieType, cookieName, cookie)
		}
	}

	public update = (cookieType: cookieType, cookieName: string, cookie: string): void => {
		const cookieDir = `${this.COOKIE_BASE_DIR}/${cookieType}/${cookieName}`

		if (fs.existsSync(cookieDir)) {
			fs.writeFileSync(cookieDir, cookie, 'utf-8');
		} else {
			throw new Error(
				"Cookie hasn't been saved before, save cookie first using save()"
			);
		}
	}

	public getAsText = (cookieType: cookieType, cookieName: string): string => {
		const cookieDir = `${this.COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		let cookieText: string = fs.existsSync(cookieDir)
			? fs.readFileSync(cookieDir, 'utf-8').toString() 
			: '';
		return cookieText;
	}

	// public getAsObj = (cookieType: cookieType, cookieName: string): any => {
	// 	return {
	// 		cookie: JSON.parse(this.getAsText(cookieType, cookieName))
	// 	};
	// }
}
