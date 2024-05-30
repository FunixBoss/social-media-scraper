import { Component } from '@angular/core';

@Component({
    selector: 'ngx-custom-catalog-filter-actions',
    template: `
        <button nbButton fullWidth="" status="primary" 
            (click)="onAdd()">
            <nb-icon icon="plus-square-outline"></nb-icon>
        </button>
    `,
})
export class CustomHashtagFilterActionsComponent {

    constructor() { }

    onAdd() {
    }
}