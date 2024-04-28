import { NbWindowRef } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <div *ngIf="renderValue==='true'" class="">
            <h6 class="d-flex justify-content-center">
                <span class="badge badge-pill badge-success">Active</span>
            </h6>
        </div>
        <div *ngIf="renderValue==='false'">
            <h6 class="d-flex justify-content-center">
                <span class="badge badge-pill badge-danger">Inactive</span>
            </h6>
        </div>
    `,
})
export class CustomCustomerActiveActionComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor() { }

    ngOnInit(): void {
        this.renderValue = this.rowData.active.toString()
    }

}