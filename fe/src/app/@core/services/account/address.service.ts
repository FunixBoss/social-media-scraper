import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Address, GetAddressResponse } from '../../models/address/address.model';
import { GetProvinceResponse, Province } from '../../models/address/provinces.model';
import { District, GetDistrictResponse } from '../../models/address/districts.model';
import { GetWardResponse, Ward } from '../../models/address/wards.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient,
  ) {
  }

  findAllAddress(): Observable<Address[]> {
    const url: string = `${this.baseUrlService.baseURL}/address`
    return this.httpClient.get<Address[]>(url)
  }

  findAllProvinces(): Observable<GetProvinceResponse> {
    const url: string = `${this.baseUrlService.baseURL}/provinces?size=63`
    return this.httpClient.get<GetProvinceResponse>(url);
  }

  findAllDistrictByProvince(provinceCode: string ): Observable<GetDistrictResponse> {
    const url: string = `${this.baseUrlService.baseURL}/provinces/${provinceCode}/districts`
    return this.httpClient.get<GetDistrictResponse>(url);
  }


  findAllWardByDistrict(districtCode: string): Observable<GetWardResponse> {
    const url: string = `${this.baseUrlService.baseURL}/districts/${districtCode}/wards`
    return this.httpClient.get<GetWardResponse>(url);
  }

  insertAddress(address: Address): Observable<Address> {
    const url: string = `${this.baseUrlService.baseURL}/account/insertAddress`
    return this.httpClient.post<Address>(url, address);
  }

  findByAccountId(accountId: number): Observable<Address[]> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/${accountId}/addresses`
    return this.httpClient.get<Address[]>(url);
  }

  getAddressStringFormAddress(address: Address) {
    const wardName = address.ward != null ? address.ward.fullName : null
    const districtName = address.district != null ? address.district.fullName : null
    const provinceName = address.province != null ? address.province.fullName : null

    return `${address.roadName}, ${wardName}, ${districtName}, ${provinceName}`
  }
}
