/* eslint-disable @angular-eslint/template/eqeqeq */
/* eslint-disable @angular-eslint/template/eqeqeq */
import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    selector: "ngx-custom-keyword",
    template: `
        <div class="row d-flex align-items-center justify-content-center">
            <div *ngIf="renderValue  === 'HIGH'">
                <h6><span class="badge badge-pill badge-success">HIGH</span></h6>
            </div>
            <div *ngIf="renderValue  === 'MEDIUM'">
                <h6><span class="badge badge-pill text-white badge-warning">MEDIUM</span></h6>
            </div>
            <div *ngIf="renderValue  === 'LOW'">
                <h6><span class="badge badge-pill badge-info">LOW</span></h6>
            </div>
        </div>    
    `,
})

export class CustomHashtagPriorityComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number | any;
    @Input() rowData: any;

    constructor() {
    }

    ngOnInit(): void {
        this.renderValue = this.value? this.value.toString() : undefined
    }
}