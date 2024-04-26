import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstagramService {

  private api:string = 'http://localhost:3000/api';

  constructor(private http:HttpClient) { 


  }

  fetchDataProfile(value: string) {
    return this.http.get(`${this.api}/ins/channel/${value}/profile`);
  }
  // fetchDataProfile(){
    
  // }

}
