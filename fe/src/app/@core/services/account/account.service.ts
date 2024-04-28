import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BaseURLService } from '../base-url.service';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Account } from '../../models/account/account.model';
import { Address } from '../../models/address/address.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  // for changing when create, edit, delete => reload
  private accountChangeSubject = new Subject<void>();

  get accountChange$(): Observable<void> {
    return this.accountChangeSubject.asObservable();
  }

  notifyAccountChange(): void {
    this.accountChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient,
  ) { }

  findAll(): Observable<Account[]> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/findAll`
    return this.httpClient.get<Account[]>(url)
  }

  findById(id: number): Observable<Account> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/findById/${id}`
    return this.httpClient.get<Account>(url);
  }

  countTotalComments(id: number): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/${id}/countComments`
    return this.httpClient.get<number>(url);
  }

  insert(account: Account): Observable<Account> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/create`
    return this.httpClient.post<Account>(url, account);
  }

  update(account: Account): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/update`
    return this.httpClient.post<boolean>(url, account);
  }

  

  updateStatus(accounts: Account[], active: boolean) {
    const mappedAccounts = accounts.map(acc => {
      return { 
        id: acc.id
      }
    })
    let formData = new FormData()
    formData.append("accounts", JSON.stringify(mappedAccounts));
    formData.append("active", active.toString());

    const url: string = `${this.baseUrlService.baseURL}/accounts/update-status`
    return this.httpClient.post<boolean>(url, formData);
  }

  delete(id: number): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/delete/${id}`
    return this.httpClient.get<boolean>(url);
  }

  
  findByEmailKeyword(emailKeyword: string): Observable<Account[]> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/findByEmailKeyword?keyword=${emailKeyword}`
    return this.httpClient.get<Account[]>(url);
  }

  isUsernameExists(username: string): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/isUsernameExist?username=${username}`
    return this.httpClient.get<boolean>(url);
  }

  isEmailExists(email: string): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/isEmailExist?email=${email}`
    return this.httpClient.get<boolean>(url);
  }

  findAllAddress(): Observable<Address[]> {
    const url: string = `${this.baseUrlService.baseURL}/address`
    return this.httpClient.get<Address[]>(url)
  }

  count(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/count`
    return this.httpClient.get<number>(url)
  }

  updateFullname(username: string, fullName: string): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/updateFullName`
    let formData = new FormData()
    formData.append("username", username)
    formData.append("fullName", fullName)
    return this.httpClient.post<boolean>(url, formData) 
  }

  updateProfileImage(formData: FormData): Observable<HttpEvent<Account>> {
    return this.httpClient.post<Account>(`${this.baseUrlService.baseURL}/updateProfileImage`, formData,
    {reportProgress: true,
      observe: 'events'
    });
  }

}
