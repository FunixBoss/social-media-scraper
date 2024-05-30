import { environment } from '../../../environments/environment';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class BaseURLService {
    private _scraperServerHost: string = `${environment.SCRAPER_SERVER_HOST}/ins`
    private _downloaderServerHost: string = `${environment.DOWNLOADER_SERVER_HOST}/ins`

    get scraperServerHost(): string {
        return this._scraperServerHost;
    }
    get downloaderServerHost(): string {
        return this._downloaderServerHost;
    }
}