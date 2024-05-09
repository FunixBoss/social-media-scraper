import { ChannelDownloadHistoryDTO } from './../../models/channel/channel-download-history.dto';
import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
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
import { tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

export interface FindAllChannelQueryOption {
    keyword?: string;
    friendshipsOf?: string;
}
export type CrawlContent = "PROFILE" | "FRIENDSHIPS" | "POSTS" | "REELS" | "ALL";
@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    // change between add & edit form
    private rowDataSubject: BehaviorSubject<FindAllHashtagDTO> = new BehaviorSubject<FindAllHashtagDTO>(null);
    public rowData$: Observable<any> = this.rowDataSubject.asObservable();

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
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/exists`
        return this.httpClient.get<ApiResponse<boolean>>(url);
    }

    findAll(options?: FindAllChannelQueryOption): Observable<ApiResponse<FindAllChannelDTO[]>> {
        let url: string;
        let { keyword, friendshipsOf } = options;
        if (keyword) {
            url = `${this.baseUrlService.baseURL}/keyword/${options.keyword}/channels`;
        } else if (friendshipsOf) {
            url = `${this.baseUrlService.baseURL}/channel/${options.friendshipsOf}/friendships`;
        } else {
            url = `${this.baseUrlService.baseURL}/channel`;
        }
        return this.httpClient.get<ApiResponse<FindAllChannelDTO[]>>(url)
    }

    crawlMulti(username: string, crawlingContents: CrawlContent[]) {
        const crawlingContentsStr = crawlingContents
            .sort((a: any, b: any) => a - b)
            .map(content => content.toLocaleLowerCase())
            .join("-")
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}?infos=${crawlingContentsStr}`
        console.log(url);

        return this.httpClient.get<ApiResponse<null> | ApiResponse<FindOneKeywordDTO>>(url)
    }

    crawlFull(username: string): Observable<ApiResponse<null> | ApiResponse<FindOneKeywordDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}?infos=profile-friendships-posts-reels`
        return this.httpClient.get<ApiResponse<null> | ApiResponse<FindOneKeywordDTO>>(url)
    }

    crawlProfile(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/profile`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlFriendships(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/friendships`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlPosts(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/posts`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    crawlReels(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/reels`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    exportExcel(username: string): Observable<ApiResponse<{ message: string }>> {
        const url = `${this.baseUrlService.baseURL}/channel/export/${username}?type=excel`;
        return this.httpClient.get<ApiResponse<{ message: string }>>(url);
    }

    findAllDownloadHistories(username: string): Observable<ApiResponse<ChannelDownloadHistoryDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/download/${username}/findall`
        return this.httpClient.get<ApiResponse<ChannelDownloadHistoryDTO[]>>(url)
    }

    downloadChannel(username: string, download_type: string, from_other: number, to_order: number): Observable<{ message: string }> {
        const url = `${this.baseUrlService.baseURL}/channel/download/${username}`;
        let params = new HttpParams()
            .set('type', download_type.toLowerCase())
            .set('from_order', from_other)
            .set('to_order', to_order)

        return this.httpClient.get<{ message: string }>(url, { params })
    }

    downloadPostNReel(username: string, id: number): Observable<{ message: string }> {
        const url = `${this.baseUrlService.baseURL}/channel/download/${username}/${id}`;
        return this.httpClient.get<{ message: string }>(url)
    }


    private getFilenameFromContentDisposition(contentDisposition: string | null): string {
        if (!contentDisposition) return 'default-filename.zip';
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
            // Matches[1] contains the value after `filename=`
            let filename = matches[1].replace(/['"]/g, ''); // Strip any surrounding quotes
            return decodeURIComponent(filename); // Handle percent-encoded UTF-8 characters
        }
        return 'default-filename.zip'; // Fallback filename
    }

    findOneFull(username: string): Observable<ApiResponse<FindOneChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}`
        return this.httpClient.get<ApiResponse<FindOneChannelDTO>>(url)
    }

    findOne(username: string): Observable<ApiResponse<FindAllChannelDTO>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/profile`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO>>(url)
    }

    findFriendships(username: string): Observable<ApiResponse<ChannelFriendshipDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/friendships`
        return this.httpClient.get<ApiResponse<ChannelFriendshipDTO[]>>(url)
    }

    findPosts(username: string): Observable<ApiResponse<ChannelPostDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/posts`
        return this.httpClient.get<ApiResponse<ChannelPostDTO[]>>(url)
    }

    findReels(username: string): Observable<ApiResponse<ChannelReelDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${username}/reels`
        return this.httpClient.get<ApiResponse<ChannelReelDTO[]>>(url)
    }

    findByKeyword(keyword: string): Observable<ApiResponse<FindAllHashtagDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${keyword}`
        return this.httpClient.get<ApiResponse<FindAllHashtagDTO[]>>(url)
    }

    delete(channel: string): Observable<ApiResponse<void>> {
        const url: string = `${this.baseUrlService.baseURL}/channel/${channel}`
        return this.httpClient.delete<ApiResponse<void>>(url);
    }

}
