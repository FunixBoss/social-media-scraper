import { Component, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { DefaultFilter } from 'ng2-smart-table';
import { CatalogService } from '../../../../@core/services/product/product-catalog.service';
import { KeywordService } from '../../../../@core/services/keyword/keyword.service';

@Component({
    selector: 'ngx-custom-catalog-filter-actions',
    template: `
        <button nbButton fullWidth="" status="primary"  (click)="onReload()">
            <nb-icon icon="refresh-outline"></nb-icon>
        </button>
    `,
})
export class CustomKeywordFilterActionsComponent {

    constructor(private keywordService: KeywordService) { }

    onReload() {
        this.keywordService.notifyKeywordChange();
    }
}