import { Component, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DefaultFilter } from 'ng2-smart-table';
import { ProductCouponService } from '../../../../@core/services/product/product-coupon.service';

@Component({
    template: `
        <button nbButton fullWidth="" status="primary" 
            (click)="onAdd()">
            <nb-icon icon="plus-square-outline"></nb-icon>
        </button>
    `,
})
export class CustomCouponFilterActionsComponent extends DefaultFilter implements OnInit, OnChanges {

    constructor(private couponService: ProductCouponService) {
        super()
    }

    onAdd() {
        this.couponService.updateHandleAndRowData('add');
    }

    ngOnInit() {let x}

    ngOnChanges(changes: SimpleChanges) {let x}
}