import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a *ngIf="!rowData.onlyHasMediaCount; else mediaCountBlock"
            [href]="'/admin/channels/posts/' + rowData.username"
            [innerHTML]="renderValue">
        </a>
        <ng-template #mediaCountBlock>
            <span [innerHTML]="renderValue"></span>
        </ng-template>
`,
})

export class CustomChannelPostLinkComponent implements ViewCell, OnInit {
    renderValue: string;
    @Input() value: string | number;
    @Input() rowData: any;

    ngOnInit(): void {
        this.renderValue = this.rowData.total_posts || this.rowData.media_count
    }   
}