import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <img [src]="renderValue" class='d-block mx-auto' alt="Customer Image" style="height: 75px; width: auto"/>
    `,
})

export class CustomCustomerImageComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor() {
    }

    ngOnInit(): void {
        this.renderValue = this.value? this.value.toString() : undefined
    }
}