import { NbWindowRef } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    selector: 'ngx-custom-action',
    template: `
        <div *ngIf="renderValue==='Canceled'">
            <h6><span class="badge badge-pill badge-danger">Canceled</span></h6>
        </div>
        <div *ngIf="renderValue==='Hanling'">
            <h6><span class="badge badge-pill badge-info">Handling</span></h6>
        </div>
        <div *ngIf="renderValue==='Delivering'">
            <h6><span class="badge badge-pill badge-warning">Delivering</span></h6>
        </div>
        <div *ngIf="renderValue==='Completed'">
            <h6><span class="badge badge-pill badge-success">Completed</span></h6>
        </div>
    `,
})
export class CustomOrderStatusActionComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor() { }

    ngOnInit(): void {
        this.renderValue = this.rowData.orderStatus.toString()
    }

}