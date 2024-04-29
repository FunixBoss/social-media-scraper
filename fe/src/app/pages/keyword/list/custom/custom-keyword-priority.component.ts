/* eslint-disable @angular-eslint/template/eqeqeq */
/* eslint-disable @angular-eslint/template/eqeqeq */
import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <div class="row d-flex align-items-center justify-content-center">
            <div *ngIf="value == 'HIGH'">
                <h6><span class="badge badge-pill badge-success">HIGH</span></h6>
            </div>
            <div *ngIf="value == 'MEDIUM'" class="ml-1">
                <h6><span class="badge badge-pill text-white badge-warning">MEDIUM</span></h6>
            </div>
            <div *ngIf="value == 'LOW'" class="ml-1">
                <h6><span class="badge badge-pill badge-info">LOW</span></h6>
            </div>
        </div>    
    `,
})

export class CustomKeywordPriorityComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number | any;
    @Input() rowData: any;

    constructor() {
    }

    ngOnInit(): void {
        console.log(this.value);
        
    }
}