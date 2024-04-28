import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DefaultFilter } from 'ng2-smart-table';
import { ProductSaleService } from '../../../../@core/services/product/product-sale.service';

@Component({
    template: `
        <button nbButton fullWidth="" status="primary" 
            (click)="onAdd()">
            <nb-icon icon="plus-square-outline"></nb-icon>
        </button>
    `,
})
export class CustomSaleFilterActionsComponent extends DefaultFilter implements OnInit, OnChanges {

    constructor(private saleService: ProductSaleService) {
        super()
    }

    onAdd() {
        this.saleService.updateHandleAndRowData('add');
    }

    ngOnInit() {let x}

    ngOnChanges(changes: SimpleChanges) {let x}
}