import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {

  private api: string = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {


  }

  //keyword
  createKeyword(name: string, priority: string) {
    const requestBody = { name, priority };
    return this.http.post<any>(`${this.api}/ins/keyword`, requestBody);
  }
  fethDataKeyword() {
    return this.http.get(`${this.api}/ins/keyword`);
  }

  fetchAllDataKeyword(keyword) {
    return this.http.get(`${this.api}/ins/keyword/${keyword.name}`);
  }

  fetchDeleteKeyword(keyword) {
    return this.http.delete(`${this.api}/ins/keyword/${keyword.name}`);
  }

  //end key word


  //Channels

  fetchDataChannels(channel: string) {
    return this.http.get(`${this.api}/ins/channel/${channel}?infos=posts-reels-profile-friendships`);
  }


}
