import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DefaultFilter } from 'ng2-smart-table';

@Component({
    template: `
        <button nbButton fullWidth="" status="primary" (click)="onAdd()">
            <nb-icon icon="plus-square-outline"></nb-icon>
        </button>
    `,
})
export class CustomChannelFilterActionsComponent extends DefaultFilter implements OnInit, OnChanges {

    inputControl = new FormControl();

    constructor(private router: Router) {
        super();
    }

    ngOnInit() {
        let x
    }

    ngOnChanges(changes: SimpleChanges) {
        let x
    }

    onAdd() {
        this.router.navigate(['/admin/products', 'add'])
    }

}