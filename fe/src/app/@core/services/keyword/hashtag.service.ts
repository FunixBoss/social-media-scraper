import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { BehaviorSubject, Subject } from 'rxjs';
import FindAllHashtagDTO from '../../models/hashtag/findall-hashtag.dto';
import { ApiResponse } from '../../models/api-response-wrapper';
import FindOneChannelDTO from '../../models/channel/findone-channel.dto';
import { CreateHashtagDto } from '../../models/hashtag/create-hashtag.dto';

@Injectable({
  providedIn: 'root'
})
export class HashtagService {
  // change between add & edit form
  private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
  private rowDataSubject: BehaviorSubject<FindAllHashtagDTO> = new BehaviorSubject<FindAllHashtagDTO>(null);

  public rowData$: Observable<any> = this.rowDataSubject.asObservable();
  public state$: Observable<string> = this.stateSubject.asObservable();

  // for changing when create, edit, delete => reload
  private hashtagChangeSubject = new Subject<void>();
  get hashtagChange$(): Observable<void> {
    return this.hashtagChangeSubject.asObservable();
  }
  notifyHashtagChange(): void { 
    this.hashtagChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { }

  findAll(keyword?: string): Observable<ApiResponse<FindAllHashtagDTO[]>> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag`
    console.log(`${keyword} in service`);
    
    let params = new HttpParams();
    if (keyword) {
      params = params.set('keyword', keyword)
    }
    return this.httpClient.get<ApiResponse<FindAllHashtagDTO[]>>(url, { params })
  }

  findByKeyword(keyword: string): Observable<ApiResponse<FindAllHashtagDTO[]>> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag/${keyword}`
    return this.httpClient.get<ApiResponse<FindAllHashtagDTO[]>>(url)
  }

  findByHashtag(hashtag: string): Observable<ApiResponse<FindOneChannelDTO>> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag/${hashtag}`
    return this.httpClient.get<ApiResponse<FindOneChannelDTO>>(url)
  }

  insert(hashtag: CreateHashtagDto): Observable<ApiResponse<FindOneChannelDTO>> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag`
    return this.httpClient.post<ApiResponse<FindOneChannelDTO>>(url, hashtag);
  }

  delete(hashtag: string): Observable<ApiResponse<void>> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag/${hashtag}`
    return this.httpClient.delete<ApiResponse<void>>(url);
  }

  deleteHashtags(hashtags: FindAllHashtagDTO[]): Observable<void> {
    const url: string = `${this.baseUrlService.baseURL}/hashtag/delete-hashtags`
    return this.httpClient.post<void>(url, hashtags);
  }
}
