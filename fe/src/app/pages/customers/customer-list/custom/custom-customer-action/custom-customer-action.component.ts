import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from "ng2-smart-table";
import { ToastState, UtilsService } from "../../../../../@core/services/utils.service";
import { AccountService } from "../../../../../@core/services/account/account.service";
import { Account } from '../../../../../@core/models/account/account.model';

@Component({
    templateUrl: 'custom-customer-action.component.html',
    styles: [
        `
            button {
                padding: 0.5rem 0.7rem;
            }
            i {
                font-size: 1.2rem;
            }
        `
    ]
})

export class CustomCustomerActionComponent implements ViewCell, OnInit{
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    windowRef: NbWindowRef;
    @ViewChild('editCustomer') editCustomerWindow: TemplateRef<any>;
    editCustomerFormGroup: FormGroup;

    constructor(
        private windowService: NbWindowService,
        private formBuilder: FormBuilder,
        private utilsService: UtilsService,
        private accountService: AccountService,
        private router: Router
    ) { }

    ngOnInit() {
        this.editCustomerFormGroup = this.formBuilder.group({
            id: [],
            username: [],
            email: [, [Validators.required, Validators.maxLength(100)]],
            password: [],
            fullName: [, [Validators.required, Validators.maxLength(100)]],
            phoneNumber: [, [Validators.required, Validators.maxLength(100)]],
            active: [false],
            image: [, Validators.required],
        })
        this.fillFormValues()
    }

    fillFormValues() {
        this.editCustomerFormGroup.get('id').setValue(this.rowData.id)
        this.editCustomerFormGroup.get('username').setValue(this.rowData.username)
        this.editCustomerFormGroup.get('email').setValue(this.rowData.email)
        this.editCustomerFormGroup.get('fullName').setValue(this.rowData.fullName)
        this.editCustomerFormGroup.get('phoneNumber').setValue(this.rowData.phoneNumber)
        this.editCustomerFormGroup.get('active').setValue(this.rowData.active)
        this.editCustomerFormGroup.get('image').setValue(this.rowData.imageUrl)
    }

    onGetDetail() {
        this.router.navigate(['/admin/customers', 'detail', this.rowData.id])
    }

    onEdit() {
        this.windowRef = this.windowService.open(
            this.editCustomerWindow,
            { title: 'Edit Customer Account Id: ' +  this.rowData.id},
        );
    }

    onEditCustomer() {
        if (this.editCustomerFormGroup.invalid) {
            this.editCustomerFormGroup.markAllAsTouched();
            this.utilsService.updateToastState(new ToastState('Edit Account Failed!', "danger"))
            return;
        }
        let account: any = new Account();
        account.id = this.editCustomerFormGroup.get('id').value
        account.username = this.editCustomerFormGroup.get('username').value
        account.email = this.editCustomerFormGroup.get('email').value
        account.password = this.editCustomerFormGroup.get('password').value
        account.fullName = this.editCustomerFormGroup.get('fullName').value
        account.phoneNumber = this.editCustomerFormGroup.get('phoneNumber').value
        account.active = this.editCustomerFormGroup.get('active').value
        account.image = this.editCustomerFormGroup.get('image').value
        console.log(account);
        
        this.accountService.update(account).subscribe(
            data => {
                if(data) {
                    this.utilsService.updateToastState(new ToastState('Edit Account Successfully!', "success"))
                    this.accountService.notifyAccountChange()
                    this.windowRef.close();
                } else {
                    this.utilsService.updateToastState(new ToastState('Edit Account Failed!', "danger"))
                }
            },
            error => console.log(error)
        )
    }

    selectFile(event: any) {
        if (event.target.files) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.editCustomerFormGroup.get('image').setValue(event.target.result)
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }
}