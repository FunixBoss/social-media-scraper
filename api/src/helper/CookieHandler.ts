import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

let COOKIE_BASE_DIR: string = path.join(__dirname, '../../uploads/cookies');
export type cookieType = "instagram" | "threads" | "facebook"

@Injectable()
export class CookieHandler {

	public save = (cookieType: cookieType, cookieName: string, cookie: string): void => {
		const cookieDir = `${COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		if (!fs.existsSync(cookieDir)) {
			fs.writeFileSync(cookieDir, cookie, 'utf-8');
		} else {
			this.update(cookieType, cookieName, cookie)
		}
	}

	public update = (cookieType: cookieType, cookieName: string, cookie: string): void => {
		const cookieDir = `${COOKIE_BASE_DIR}/${cookieType}/${cookieName}`

		if (fs.existsSync(cookieDir)) {
			fs.writeFileSync(cookieDir, cookie, 'utf-8');
		} else {
			throw new Error(
				"Cookie hasn't been saved before, save cookie first using save()"
			);
		}
	}

	public getAsText = (cookieType: cookieType, cookieName: string): string => {
		const cookieDir = `${COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		
		let cookieText: string = fs.existsSync(cookieDir)
			? fs.readFileSync(cookieDir, 'utf-8').toString() : '';
		return cookieText;
	}

	public getAsObj = (cookieType: cookieType, cookieName: string): any => {
		const cookieDir = `${COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		
		let cookieText: string = fs.existsSync(cookieDir)
			? fs.readFileSync(cookieDir, 'utf-8').toString() : '';
		return {
			cookie: JSON.parse(cookieText)
		};
	}
}
