import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a [href]="'/admin/hashtags/list?keyword=' + rowData.name" target="_blank" [innerHTML]="rowData.total_hashtags  "></a>
    `,
})

export class CustomHashtagLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;
    reelsUrl: string;

    ngOnInit(): void {
        this.renderValue = this.value? this.value.toString() : undefined
    }
}