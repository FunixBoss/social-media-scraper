import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { BehaviorSubject, Subject } from 'rxjs';
import { CouponType } from '../../models/coupon/coupon-type.model';
import { Coupon, GetCouponResponse } from '../../models/coupon/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class ProductCouponService {

  // for update state & rowDate and change between add & edit form
  private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
  private rowDataSubject: BehaviorSubject<Coupon> = new BehaviorSubject<Coupon>(null);

  public state$: Observable<string> = this.stateSubject.asObservable();
  public rowData$: Observable<Coupon> = this.rowDataSubject.asObservable();

  updateHandleAndRowData(state: string, rowData?: any) {
    this.stateSubject.next(state);
    if(rowData != undefined) {
      this.rowDataSubject.next(rowData as Coupon); 
    }
  }

  // for changing when create, edit, delete => reload
  private couponChangeSubject = new Subject<void>();

  get couponChange$(): Observable<void> {
    return this.couponChangeSubject.asObservable();
  }

  notifyCouponChange(): void {
    this.couponChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { 
  }

  findAll(): Observable<GetCouponResponse> {
    const url: string = `${this.baseUrlService.baseURL}/coupons`
    return this.httpClient.get<GetCouponResponse>(url)
  }

  insert(coupon: Coupon): Observable<Coupon> {
    let coupon2: any = coupon
    coupon2.couponType = `/coupon-types/${coupon.couponType.couponTypeId}`

    const url: string = `${this.baseUrlService.baseURL}/coupons`
    return this.httpClient.post<Coupon>(url, coupon2);
  }

  update(coupon: Coupon): Observable<boolean> {
    let coupon2: any = coupon
    coupon2.couponType = `/coupon-types/${coupon.couponType.couponTypeId}`

    const url: string = `${this.baseUrlService.baseURL}/coupons`
    return this.httpClient.post<boolean>(url, coupon);
  }

  delete(couponId: number): Observable<void> {    
    const url: string = `${this.baseUrlService.baseURL}/coupons/${couponId}`
    return this.httpClient.delete<void>(url); 
  }

  findCouponTypeById(id: number): CouponType {
    if(id == 1) {
      return { couponTypeId: 1, typeName: 'Fixed' }
    } else {
      return { couponTypeId: 2, typeName: 'Percent' }
    }
  }

  isCouponExists(couponCode: string): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/coupons/isCouponExist?code=${couponCode}`
    return this.httpClient.get<boolean>(url);
  }

  isCouponCanBeUsed(couponCode: string): Observable<boolean> {
    const url: string = `${this.baseUrlService.baseURL}/coupons/isCouponCanBeUsed?code=${couponCode}`
    return this.httpClient.get<boolean>(url);
  }

  findByCode(couponCode: string): Observable<Coupon> {
    const url: string = `${this.baseUrlService.baseURL}/coupons/findByCode?code=${couponCode}`
    return this.httpClient.get<Coupon>(url);
  }

  deleteCoupons(coupons: Coupon[]): Observable<void> {
    let mappedCoupon = coupons.map(c => {
      return {
        couponId: c.couponId
      }
    })
    const url: string = `${this.baseUrlService.baseURL}/coupons/delete-coupons`
    return this.httpClient.post<void>(url, mappedCoupon);
  }
}
