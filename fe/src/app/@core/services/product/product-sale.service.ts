import { Injectable } from '@angular/core';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs-compat';
import { BehaviorSubject, Subject } from 'rxjs';
import { GetProductSaleResponse, ProductSale } from '../../models/sale/product-sale.model';
import { ProductSaleType } from '../../models/sale/product-sale-type.model';

@Injectable({
  providedIn: 'root'
})
export class ProductSaleService {

  // for update state & rowDate and change between add & edit form
  private stateSubject: BehaviorSubject<string> = new BehaviorSubject<string>('add');
  private rowDataSubject: BehaviorSubject<ProductSale> = new BehaviorSubject<ProductSale>(null);

  public state$: Observable<string> = this.stateSubject.asObservable();
  public rowData$: Observable<ProductSale> = this.rowDataSubject.asObservable();

  updateHandleAndRowData(state: string, rowData?: any) {
    this.stateSubject.next(state);
    if(rowData != undefined) {
      this.rowDataSubject.next(rowData as ProductSale); 
    }
  }

  // for changing when create, edit, delete => reload
  private saleChangeSubject = new Subject<void>();
  get saleChange$(): Observable<void> {
    return this.saleChangeSubject.asObservable();
  }
  notifyProductSaleChange(): void {
    this.saleChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient
  ) { 
  }

  findAll(): Observable<GetProductSaleResponse> {
    const url: string = `${this.baseUrlService.baseURL}/product-sales`
    return this.httpClient.get<GetProductSaleResponse>(url)
  }

  insert(sale: ProductSale): Observable<boolean> {
    let sale2: any = sale
    sale2.productSaleType = `/product-sale-types/${sale.productSaleType.productSaleTypeId}`

    const url: string = `${this.baseUrlService.baseURL}/product-sales`
    return this.httpClient.post<boolean>(url, sale2);
  }

  update(sale: ProductSale): Observable<boolean> {
    let sale2: any = sale
    sale2.productSaleType = `/product-sale-types/${sale.productSaleType.productSaleTypeId}`

    const url: string = `${this.baseUrlService.baseURL}/product-sales`
    return this.httpClient.post<boolean>(url, sale2);
  }

  delete(productSaleId: number): Observable<void> {    
    const url: string = `${this.baseUrlService.baseURL}/product-sales/${productSaleId}`
    return this.httpClient.delete<void>(url); 
  }

  findProductSaleTypeById(id: number): ProductSaleType {
    if(id == 1) {
      return { productSaleTypeId: 1, typeName: 'Fixed' }
    } else {
      return { productSaleTypeId: 2, typeName: 'Percent' }
    }
  }

  deleteProductSales(sales: ProductSale[]): Observable<void> {
    let mappedSales = sales.map(s => {
      return {
        productSaleId: s.productSaleId
      }
    })
    const url: string = `${this.baseUrlService.baseURL}/product-sales/delete-sales`
    return this.httpClient.post<void>(url, mappedSales);
  }

  updateStatus(sales: ProductSale[], status: boolean): Observable<boolean>{
    const mappedSales = sales.map(s => {
      return { 
        productSaleId: s.productSaleId
      }
    })
    let formData = new FormData()
    formData.append("sales", JSON.stringify(mappedSales));
    formData.append("active", status.toString());

    const url: string = `${this.baseUrlService.baseURL}/product-sales/update-status-sales`
    return this.httpClient.post<boolean>(url, formData);
  }

}
