import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { BehaviorSubject, Subject } from 'rxjs';
import FindAllKeywordDTO from '../../models/keyword/findall-keyword.dto';
import { ApiResponse } from '../../models/api-response-wrapper';
import FindOneChannelDTO from '../../models/channel/findone-channel.dto';
import { CreateKeywordDto } from '../../models/keyword/create-keyword.dto';
import FindAllHashtagDTO from '../../models/hashtag/findall-hashtag.dto';

@Injectable({
  providedIn: 'root'
})
export class KeywordService {
  // change between add & edit form
  private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
  private rowDataSubject: BehaviorSubject<FindAllKeywordDTO> = new BehaviorSubject<FindAllKeywordDTO>(null);

  public rowData$: Observable<any> = this.rowDataSubject.asObservable();
  public state$: Observable<string> = this.stateSubject.asObservable();

  // for changing when create, edit, delete => reload
  private keywordChangeSubject = new Subject<void>();
  get keywordChange$(): Observable<void> {
    return this.keywordChangeSubject.asObservable();
  }
  notifyKeywordChange(): void {
    this.keywordChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { }

  findAll(): Observable<ApiResponse<FindAllKeywordDTO[]>> {
    const url: string = `${this.baseUrlService.insURL}/keyword`
    return this.httpClient.get<ApiResponse<FindAllKeywordDTO[]>>(url)
  }

  findByKeyword(keyword: string): Observable<ApiResponse<FindOneChannelDTO>> {
    const url: string = `${this.baseUrlService.insURL}/keyword/${keyword}`
    return this.httpClient.get<ApiResponse<FindOneChannelDTO>>(url)
  }

  insert(keyword: CreateKeywordDto): Observable<ApiResponse<FindOneChannelDTO>> {
    const url: string = `${this.baseUrlService.insURL}/keyword`
    return this.httpClient.post<ApiResponse<FindOneChannelDTO>>(url, keyword);
  }

  delete(keyword: string): Observable<ApiResponse<void>> {
    const url: string = `${this.baseUrlService.insURL}/keyword/${keyword}`
    return this.httpClient.delete<ApiResponse<void>>(url);
  }

  deleteKeywords(keywords: FindAllKeywordDTO[]): Observable<void> {
    const url: string = `${this.baseUrlService.insURL}/keyword/delete-keywords`
    return this.httpClient.post<void>(url, keywords);
  }

  findHashtags(keyword: string): Observable<ApiResponse<FindAllHashtagDTO[]>> {
    const url: string = `${this.baseUrlService.insURL}/keyword/${keyword}/hashtags`
    return this.httpClient.get<ApiResponse<FindAllKeywordDTO[]>>(url)
  }
}
