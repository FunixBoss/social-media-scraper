import { Component, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DefaultFilter } from 'ng2-smart-table';
import { CatalogService } from '../../../../@core/services/product/product-catalog.service';

@Component({
    selector: 'ngx-custom-catalog-filter-actions',
    template: `
        <button nbButton fullWidth="" status="primary" 
            (click)="onAdd()">
            <nb-icon icon="plus-square-outline"></nb-icon>
        </button>
    `,
})
export class CustomCatalogFilterActionsComponent {

    constructor(private catalogService: CatalogService) { }

    onAdd() {
        this.catalogService.updateHandleAndRowData('add');
    }
}