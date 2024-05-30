import { NbWindowRef } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    selector: 'ngx-custom-action',
    template: `
        <div class="row d-flex align-items-center justify-content-center">
            <div *ngIf="value.new === true">
                <h6><span class="badge badge-pill badge-success">NEW</span></h6>
            </div>
            <div *ngIf="value.top === true" class="ml-1">
                <h6><span class="badge badge-pill badge-danger">TOP</span></h6>
            </div> 
            <div *ngIf="value.active === true" class="ml-1">
                <h6><span class="badge badge-pill text-white badge-warning">ACTIVE</span></h6>
            </div>
            <div *ngIf="value.sale === true" class="ml-1">
                <h6><span class="badge badge-pill badge-info">SALE</span></h6>
            </div>
        </div>
    `,
})
export class CustomChannelStatusComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number | any;
    @Input() rowData: any;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor() { }

    ngOnInit(): void {
        this.value = JSON.parse(this.value);
        this.renderValue = JSON.stringify(this.value);
    }

}