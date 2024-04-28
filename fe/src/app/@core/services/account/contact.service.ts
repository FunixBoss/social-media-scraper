import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Address, GetAddressResponse } from '../../models/address/address.model';
import { GetProvinceResponse, Province } from '../../models/address/provinces.model';
import { District, GetDistrictResponse } from '../../models/address/districts.model';
import { GetWardResponse, Ward } from '../../models/address/wards.model';
import { Contact, GetContactResponse } from '../../models/account/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private contactChangeSubject = new Subject<void>();

  get contactChange$(): Observable<void> {
    return this.contactChangeSubject.asObservable();
  }

  notifyContactChange(): void {
    this.contactChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient,
  ) {
  }

  findAll(): Observable<GetContactResponse> {
    const url: string = `${this.baseUrlService.baseURL}/contacts`
    return this.httpClient.get<GetContactResponse>(url)
  }

  findById(contactId: string): Observable<Contact> {
    const url: string = `${this.baseUrlService.baseURL}/contacts/${contactId}`
    return this.httpClient.get<Contact>(url)
  }

  insert(contact: Contact): Observable<Contact> {
    const url: string = `${this.baseUrlService.baseURL}/contacts`
    return this.httpClient.post<Contact>(url, contact);
  }

  delete(contactId: number): Observable<void> {
    const url: string = `${this.baseUrlService.baseURL}/contacts/${contactId}`
    return this.httpClient.delete<void>(url);
  }

  deleteContacts(contacts: Contact[]): Observable<void> {
    const mappedContacts = contacts.map(contact => {
      return {contactId: contact.contactId}
    })
    const url: string = `${this.baseUrlService.baseURL}/accounts/delete-contacts`
    return this.httpClient.post<void>(url, mappedContacts);
  }
}
