import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a [href]="'/admin/channels/list?keyword=' + rowData.name" target="_blank" [innerHTML]="rowData.total_channels"></a>
    `,
})

export class CustomChannelLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;
    reelsUrl: string;

    ngOnInit(): void {
        this.renderValue = this.value? this.value.toString() : undefined
    }
}