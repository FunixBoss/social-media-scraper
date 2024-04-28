import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BaseURLService } from "../base-url.service";
import { GetPaymentMethodResponse, PaymentMethod } from '../../models/order/payment-method.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentMethodService {
    constructor(
        private baseUrlService: BaseURLService,
        private httpClient: HttpClient
    ) { }

    findAll(): Observable<GetPaymentMethodResponse> {
        const url: string = `${this.baseUrlService.baseURL}/payment-methods`
        return this.httpClient.get<GetPaymentMethodResponse>(url)
    }

}