import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a *ngIf="rowData.total_posts" 
        [href]="'/admin/channels/posts/' + rowData.username" 
        target="_blank" 
        [innerHTML]="rowData.total_posts"></a>
    `,
})

export class CustomChannelPostLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;
    reelsUrl: string;

    ngOnInit(): void {
        this.renderValue = this.value ? this.value.toString() : undefined
    }
}