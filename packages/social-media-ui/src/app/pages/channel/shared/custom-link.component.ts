import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a [href]="rowData.url" target="_blank"  [innerHTML]="rowData.username"></a>
    `,
})

export class CustomLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor() {
    }
 
    ngOnInit(): void {
        this.renderValue = this.value? this.value.toString() : undefined
    }
}