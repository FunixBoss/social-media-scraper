import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DefaultFilter } from 'ng2-smart-table';
import { debounceTime } from 'rxjs-compat/operator/debounceTime';
import { distinctUntilChanged } from 'rxjs-compat/operator/distinctUntilChanged';

@Component({
    template: `
        <div class="" [formGroup]="form">
            <nb-select fullWidth multiple placeholder="Status..." formControlName="selectedItems">
                <nb-option value="new">NEW</nb-option>
                <nb-option value="top">TOP</nb-option>
                <nb-option value="active">ACTIVE</nb-option>
                <nb-option value="sale">SALE</nb-option>
            </nb-select>
        </div>
    `,
})
export class CustomChannelStatusFilterComponent extends DefaultFilter implements OnInit, OnChanges {
    form: FormGroup;
    inputControl = new FormControl();

    constructor(
        private formBuilder: FormBuilder
    ) {
        super();
        this.form = this.formBuilder.group({
            selectedItems: []
        });
    }

    ngOnInit() {
        this.form.get('selectedItems').valueChanges
            .subscribe((value: string[]) => {
                this.query = (value.length > 0) ? JSON.stringify(value) : '';

                this.setFilter();
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.query) {
            this.query = changes.query.currentValue;
            this.inputControl.setValue(this.query);
        }
    }

}