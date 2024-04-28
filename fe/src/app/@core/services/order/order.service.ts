import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order } from '../../models/order/order.model';
import { BaseURLService } from '../base-url.service';
import { HttpClient } from '@angular/common/http';
import { OrderStatus } from '../../models/order/order-status.model';
import { OrderStatusService } from './order-status.service';
import { PaymentMethodService } from './payment-method.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderChangeSubject = new Subject<void>();

  get orderChange$(): Observable<void> {
    return this.orderChangeSubject.asObservable();
  }

  notifyOrderChange(): void {
    this.orderChangeSubject.next();
  }

  constructor(
    private baseUrlService: BaseURLService,
    private httpClient: HttpClient,
  ) { }


  findById(id: number): Observable<Order> {
    const url: string = `${this.baseUrlService.baseURL}/orders/findById/${id}`
    return this.httpClient.get<Order>(url)
  }
  

  findAll(): Observable<Order[]> {
    const url: string = `${this.baseUrlService.baseURL}/orders/findAll`
    return this.httpClient.get<Order[]>(url)
  }

  insert(order: any): Observable<Order> {
    const url: string = `${this.baseUrlService.baseURL}/orders/create`
    return this.httpClient.post<Order>(url, order);
  }

  updateOrderStatus(orderId: number, orderStatus: OrderStatus): Observable<boolean> {
    const order = {
      orderId: orderId
    }
    let formData = new FormData()
    formData.append("order", JSON.stringify(order));
    formData.append("orderStatus", JSON.stringify(orderStatus));
    const url: string = `${this.baseUrlService.baseURL}/orders/update-status`
    return this.httpClient.post<boolean>(url, formData);
  }

  updateOrdersStatus(orders: Order[], status: OrderStatus): Observable<boolean>{
    const mappedOrders = orders.map(o => {
      return { 
        orderId: o.orderId
      }
    })
    const mappedStatus = {
      orderStatusId: status.orderStatusId,
      statusName: status.statusName,
      description: status.description
    }
    let formData = new FormData()
    formData.append("orders", JSON.stringify(mappedOrders));
    formData.append("orderStatus", JSON.stringify(mappedStatus));

    const url: string = `${this.baseUrlService.baseURL}/orders/update-orders-status`
    return this.httpClient.post<boolean>(url, formData);
  }

  delete(orderId: number): Observable<boolean> {    
    const url: string = `${this.baseUrlService.baseURL}/order/delete/${orderId}`
    return this.httpClient.delete<boolean>(url); 
  }

  findOrderStatusById(orderId: number): Observable<OrderStatus> {
    const url: string = `${this.baseUrlService.baseURL}/orders/${orderId}/orderStatus`
    return this.httpClient.get<OrderStatus>(url).pipe( 
      map(data => {
        return {
          orderStatusId: data.orderStatusId,
          statusName: data.statusName,
          description: data.description
        }
      })
    );
  }

  count(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/orders/count`
    return this.httpClient.get<number>(url)
  }

  countOrdersLastMonth(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/orders/countOrdersLastMonth`
    return this.httpClient.get<number>(url)
  }

  countOrdersThisWeek(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/orders/countOrdersThisWeek`
    return this.httpClient.get<number>(url)
  }

  countOrdersToday(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/orders/countOrdersToday`
    return this.httpClient.get<number>(url)
  }

  countSold(): Observable<number> {
    const url: string = `${this.baseUrlService.baseURL}/orders/countProductSold`
    return this.httpClient.get<number>(url)
  }
}
