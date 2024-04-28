import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { GetProductSizeResponse } from '../../models/product/product-size.model';

@Injectable({
  providedIn: 'root'
})
export class ProductSizeService {

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) {
  }

  findAll(): Observable<GetProductSizeResponse> {
    const url: string = `${this.baseUrlService.baseURL}/product-sizes`
    return this.httpClient.get<GetProductSizeResponse>(url)
  }
}
