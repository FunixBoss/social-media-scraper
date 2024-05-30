import { Injectable } from "@angular/core";
import { BaseURLService } from "../base-url.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { ApiResponse } from "../../models/api-response-wrapper";
import { ChannelDownloadHistoryDTO } from "../../models/channel/channel-download-history.dto";
import { DownloadOptions } from "../../models/channel-scraper-info";

@Injectable({
    providedIn: 'root'
})
export class ChannelDownloadService {
    // for changing when create, edit, delete => reload
    private downloadChangeSubject = new Subject<void>();
    get downloadChange$(): Observable<void> {
        return this.downloadChangeSubject.asObservable();
    }

    notifyDownloadChange(): void {
        this.downloadChangeSubject.next();
    }
    constructor(
        private baseUrlService: BaseURLService,
        private httpClient: HttpClient
    ) { }

    findAllDownloadHistories(username: string): Observable<ApiResponse<ChannelDownloadHistoryDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/download/${username}/findall`
        return this.httpClient.get<ApiResponse<ChannelDownloadHistoryDTO[]>>(url)
    }

    downloadChannel(username: string, options: DownloadOptions): Observable<ApiResponse<{ message: string }>> {
        const url = `${this.baseUrlService.downloaderServerHost}/channel/download/${username}`;
        return this.httpClient.post<ApiResponse<{ message: string }>>(url, options)
    }
} 