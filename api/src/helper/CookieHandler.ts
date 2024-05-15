import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { Protocol } from 'puppeteer';

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

	getAllCookies(cookieType: string): string[] {
		const cookieDir = `${this.COOKIE_BASE_DIR}/${cookieType}`;
		const cookieStrs: string[] = [];
		console.log("Read all cookies");
		
		try {
			const files = fs.readdirSync(cookieDir);  // Synchronously read directory contents
			files.forEach(file => {
				const filePath = `${cookieDir}/${file}`;
				console.log(filePath);
				
				const content = fs.readFileSync(filePath, 'utf-8');  // Synchronously read file content
				cookieStrs.push(content);
			});
		} catch (err) {
			console.log('Error reading directory:', err);
		}
		return cookieStrs;
	}
	

	public getAsText = (cookieType: cookieType, cookieName: string): string => {
		const cookieDir = `${this.COOKIE_BASE_DIR}/${cookieType}/${cookieName}`
		let cookieText: string = fs.existsSync(cookieDir)
			? fs.readFileSync(cookieDir, 'utf-8').toString()
			: '';
		return cookieText;
	}

	public getAsObj = (cookieType: cookieType, cookieName: string): Protocol.Network.Cookie[] => {
		return JSON.parse(this.getAsText(cookieType, cookieName));
	}
}
