import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a [routerLink]="['/hashtags/list']" [queryParams]="{ keyword: rowData.name }" [innerHTML]="rowData.total_hashtags"></a>
    `,
})

export class CustomHashtagLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;
    reelsUrl: string;

    ngOnInit(): void {
        this.renderValue = this.value ? this.value.toString() : undefined
    }
}