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

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    // change between add & edit form
    private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
    private rowDataSubject: BehaviorSubject<FindAllHashtagDTO> = new BehaviorSubject<FindAllHashtagDTO>(null);

    public rowData$: Observable<any> = this.rowDataSubject.asObservable();
    public state$: Observable<string> = this.stateSubject.asObservable();

    // for changing when create, edit, delete => reload
    private channelChangeSubject = new Subject<void>();
    get channelChange$(): Observable<void> {
        return this.channelChangeSubject.asObservable();
    }

    notifyHashtagChange(): void {
        this.channelChangeSubject.next();
    }

    constructor(
        private baseUrlService: BaseURLService,
        private httpClient: HttpClient
    ) { }

    findAll(): Observable<ApiResponse<FindAllChannelDTO[]>> {
        const url: string = `${this.baseUrlService.baseURL}/channel`
        return this.httpClient.get<ApiResponse<FindAllChannelDTO[]>>(url)
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
