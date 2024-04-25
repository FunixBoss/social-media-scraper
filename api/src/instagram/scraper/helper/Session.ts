import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import { formatCookie } from "../utils";
import { config } from "../config";
import { csrfToken, LoginData } from "../types";
import { randomUUID } from "crypto";

export const getCsrfToken = async (): Promise<csrfToken> => {
    try {
        const { headers } = await axios({
            method: 'GET',
            url: 'https://www.instagram.com/accounts/login/'
        });
        let csrfToken: csrfToken = headers["set-cookie"]?.find(x => x.match(/csrftoken=(.*?);/)?.[1])?.match(/csrftoken=(.*?);/)?.[1] || '';
        return csrfToken
    } catch (error) {
        throw error
    }
}

/**
 * @param {username} username 
 * @param {password} password 
 * @param withLoginData if true, it will return logindata
 * @returns 
 */
export const getCookie = async (username: string, password: string, withLoginData: boolean = false) => {
    try {
        let login_headers = {
            "User-Agent": "Instagram 100.1.0.29.135 Android",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: "",
        }
        const { headers: getHeaders } = await axios.get('https://i.instagram.com/api/v1/si/fetch_headers/?challenge_type=signup')
        login_headers.Cookie = formatCookie(getHeaders["set-cookie"]) || ''
        const res = await axios.post(
            'https://i.instagram.com/api/v1/accounts/login/',
            `username=${username}&password=${encodeURIComponent(password)}&device_id=${randomUUID()}&login_attempt_count=0`, {
            headers: login_headers
        })
        const cookie: string = formatCookie(res.headers['set-cookie']) || '';
        const result = res.data;
        if (withLoginData) {
            result['cookie'] = cookie;
            return result as LoginData
        } else return cookie
    } catch (error) {
        throw error
    }
}