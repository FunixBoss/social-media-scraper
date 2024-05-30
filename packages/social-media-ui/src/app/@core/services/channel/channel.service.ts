import { ChannelDownloadHistoryDTO } from './../../models/channel/channel-download-history.dto';
import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { BehaviorSubject, Subject } from 'rxjs';
import FindAllHashtagDTO from '../../models/channel/findall-channel.dto';
import { ApiResponse } from '../../models/api-response-wrapper';
import FindOneChannelDTO from '../../models/channel/findone-channel.dto';
import ChannelPostDTO from '../../models/channel/channel-post.dto';
import FindAllChannelDTO from '../../models/channel/findall-channel.dto';
import ChannelReelDTO from '../../models/channel/channel-reel.dto';
import ChannelFriendshipDTO from '../../models/channel/channel-friendship.dto';
import FindOneKeywordDTO from '../../models/keyword/findone-keyword.dto';
import { ChannelScraperInfo } from '../../models/channel-scraper-info';

export interface FindAllChannelQueryOption {
    keyword?: string;
    friendshipsOf?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    // for changing when create, edit, delete => reload
    private channelChangeSubject = new Subject<void>();
    get channelChange$(): Observable<void> {
        return this.channelChangeSubject.asObservable();
    }

    notifyChannelChange(): void {
        this.channelChangeSubject.next();
    }

    constructor(
        private baseUrlService: BaseURLService,
        private httpClient: HttpClient
    ) { }

    isExists(username: string): Observable<ApiResponse<boolean>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/exists`
        return this.httpClient.get<ApiResponse<boolean>>(url);
    }

    findAll(options?: FindAllChannelQueryOption): Observable<ApiResponse<FindAllChannelDTO[]>> {
        let url: string;
        let { keyword, friendshipsOf } = options;
        if (keyword) {
            url = `${this.baseUrlService.scraperServerHost}/keyword/${options.keyword}/channels`;
        } else if (friendshipsOf) {
            url = `${this.baseUrlService.scraperServerHost}/channel/${options.friendshipsOf}/friendships`;
        } else {
            url = `${this.baseUrlService.scraperServerHost}/channel`;
        }
        return this.httpClient.get<ApiResponse<FindAllChannelDTO[]>>(url)
    }

    crawlMulti(usernames: string[], crawlContent: ChannelScraperInfo): Observable<ApiResponse<FindOneKeywordDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/crawl-multi`
        const params = new HttpParams()
            .set("usernames", usernames.join(","))
        return this.httpClient.post<ApiResponse<FindOneKeywordDTO[]>>(url, crawlContent, { params })
    }

    crawlOne(username: string, crawlContent: ChannelScraperInfo): Observable<ApiResponse<null> | ApiResponse<FindOneKeywordDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/crawl/${username}`
        return this.httpClient.post<ApiResponse<FindOneKeywordDTO>>(url, crawlContent)
    }

    crawlProfile(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/profile`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlFriendships(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/friendships`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlPosts(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/posts`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlReels(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/reels`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    exportExcel(username: string): Observable<ApiResponse<{ message: string }>> {
        const url = `${this.baseUrlService.scraperServerHost}/channel/export/${username}?type=excel`;
        return this.httpClient.get<ApiResponse<{ message: string }>>(url);
    }

    findOneFull(username: string): Observable<ApiResponse<FindOneChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}`
        return this.httpClient.get<ApiResponse<FindOneChannelDTO>>(url)
    }

    findOne(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/profile`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    findFriendships(username: string): Observable<ApiResponse<ChannelFriendshipDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/friendships`
        return this.httpClient.get<ApiResponse<ChannelFriendshipDTO[]>>(url)
    }

    findPosts(username: string): Observable<ApiResponse<ChannelPostDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/posts`
        return this.httpClient.get<ApiResponse<ChannelPostDTO[]>>(url)
    }

    findReels(username: string): Observable<ApiResponse<ChannelReelDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${username}/reels`
        return this.httpClient.get<ApiResponse<ChannelReelDTO[]>>(url)
    }

    findByKeyword(keyword: string): Observable<ApiResponse<FindAllHashtagDTO[]>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/${keyword}`
        return this.httpClient.get<ApiResponse<FindAllHashtagDTO[]>>(url)
    }

    delete(username: string): Observable<ApiResponse<void>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/delete/${username}`
        return this.httpClient.delete<ApiResponse<void>>(url);
    }

    deleteMulti(usernames: string[]): Observable<ApiResponse<void>> {
        const url: string = `${this.baseUrlService.scraperServerHost}/channel/delete-multi`
        const params = new HttpParams()
            .set("usernames", usernames.map(u => u.trim()).join(","))
        return this.httpClient.delete<ApiResponse<void>>(url, { params });
    }

}
