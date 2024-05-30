import { Component, OnInit, Input } from "@angular/core";
import { ViewCell } from "ng2-smart-table";

@Component({
    template: `
        <a [routerLink]="['/channels/list']" [queryParams]="{ friendshipsOf: rowData.username }" [innerHTML]="renderValue"></a>
    `,
})

export class CustomChannelFriendshipLinkComponent implements ViewCell, OnInit {
    renderValue: string | number;

    @Input() value: string | number;
    @Input() rowData: any;

    ngOnInit(): void {
        this.renderValue = this.value ? this.value.toString() : undefined
    }
}