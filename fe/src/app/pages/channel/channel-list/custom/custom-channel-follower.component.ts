import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <span [innerHTML]="formattedNumber"></span>
    `,
})

export class CustomChannelFollowerComponent implements ViewCell, OnInit {
    renderValue: string;
    formattedNumber: string;
    @Input() value: string | number;
    @Input() rowData: any;

    ngOnInit(): void {
        this.renderValue = this.value ? this.value.toString() : undefined
        this.formattedNumber = this.value ? this.value.toLocaleString('de-DE') : undefined
    }   
}