import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BaseURLService } from "../base-url.service";
import { GetOrderStatusResponse } from '../../models/order/order-status.model';

@Injectable({
    providedIn: 'root'
})
export class OrderStatusService {
    constructor(
        private baseUrlService: BaseURLService,
        private httpClient: HttpClient
    ) { }

    findAll(): Observable<GetOrderStatusResponse> {
        const url: string = `${this.baseUrlService.baseURL}/order-statuses`
        return this.httpClient.get<GetOrderStatusResponse>(url)
    }
}