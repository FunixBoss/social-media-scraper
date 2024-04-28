import { NbWindowRef } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    selector: 'ngx-custom-action',
    template: `
        <div *ngIf="renderValue==='true'">
            <h6><span class="badge badge-pill badge-success">Active</span></h6>
        </div>
        <div *ngIf="renderValue==='false'">
            <h6><span class="badge badge-pill badge-danger">Inactive</span></h6>
        </div>
    `,
})
export class CustomSaleActiveActionComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor() { }

    ngOnInit(): void {
        this.renderValue = this.rowData.active.toString()
    }

}