import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a *ngIf="rowData.total_posts" 
        [href]="'/admin/channels/reels/' + rowData.username" 
        target="_blank"
        [innerHTML]="rowData.total_reels"></a>
    `,
})

export class CustomChannelReelLinkComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;
    reelsUrl: string;

    ngOnInit(): void {
        this.renderValue = this.value ? this.value.toString() : undefined
    }
}