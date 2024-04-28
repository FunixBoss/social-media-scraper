import { Injectable } from '@angular/core';
import { ProductReview } from '../../models/product/product-review.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseURLService } from '../base-url.service';

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { }

  findAll(): Observable<ProductReview[]> {
    const url: string = `${this.baseUrlService.baseURL}/product-review`
    return this.httpClient.get<ProductReview[]>(url)
  }

  findByProductId(productId: number): Observable<ProductReview[]> {
    const url: string = `${this.baseUrlService.baseURL}/products/${productId}/productReviews`
    return this.httpClient.get<ProductReview[]>(url)
  }

  findByAccountId(productId: number): Observable<ProductReview[]> {
    const url: string = `${this.baseUrlService.baseURL}/accounts/${productId}/productReviews`
    return this.httpClient.get<ProductReview[]>(url)
  }
}
