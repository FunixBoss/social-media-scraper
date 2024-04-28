import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { DefaultFilter } from 'ng2-smart-table';
import { ToastState, UtilsService } from '../../../../../@core/services/utils.service';
import { CustomValidator, isEmailExisting, isEmailNotExisting, isUsernameExisting } from '../../../../../@core/validators/custom-validator';
import { AccountService } from '../../../../../@core/services/account/account.service';
import { Account } from '../../../../../@core/models/account/account.model';

@Component({
    templateUrl: 'custom-customer-filter-actions.component.html',
    styleUrls: ['custom-customer-filter-actions.component.scss']
})
export class CustomCustomerFilterActionsComponent extends DefaultFilter implements OnInit, OnChanges {

    inputControl = new FormControl();

    windowRef: NbWindowRef;
    @ViewChild('createCustomer') createCustomerWindow: TemplateRef<any>;
    addCustomerFormGroup: FormGroup;

    constructor(
        private windowService: NbWindowService,
        private formBuilder: FormBuilder,
        private utilsService: UtilsService,
        private accountService: AccountService
    ) {
        super();
    }

    ngOnInit() {
        this.addCustomerFormGroup = this.formBuilder.group({
            username: [, 
                [CustomValidator.notBlank,
                Validators.minLength(3),
                Validators.maxLength(20),
                Validators.pattern("^[a-zA-Z0-9_]{3,20}$")],
                [isUsernameExisting(this.accountService)]],
            email: [, 
                    [CustomValidator.notBlank,
                    Validators.maxLength(50),
                    Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")],
                    [isEmailExisting(this.accountService)]],
            password: [, 
                    [CustomValidator.notBlank,
                    Validators.minLength(8),
                    Validators.maxLength(50),
                    Validators.pattern(/^(?=.*\d)(?=.*[a-zA-Z]).{8,}$/)]],
            fullName: [, [CustomValidator.notBlank, Validators.maxLength(50)]],
            phoneNumber: [,  [Validators.pattern(/^\s*\d{10}\s*$/)]],
            active: [true],
            image: [],
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        1
    }

    onAdd() {
        this.windowRef = this.windowService.open(
            this.createCustomerWindow,
            { title: 'Add Customer Account' },
        );
    }

    addCustomer() {
        console.log(this.addCustomerFormGroup);

        if (this.addCustomerFormGroup.invalid) {
            this.addCustomerFormGroup.markAllAsTouched();
            this.utilsService.updateToastState(new ToastState('Add Account Failed!', "danger"))
            return;
        }
        let account: Account = new Account();
        account.username = this.addCustomerFormGroup.get('username').value
        account.email = this.addCustomerFormGroup.get('email').value
        account.password = this.addCustomerFormGroup.get('password').value
        account.fullName = this.addCustomerFormGroup.get('fullName').value
        account.phoneNumber = this.addCustomerFormGroup.get('phoneNumber').value
        account.active = this.addCustomerFormGroup.get('active').value
        account.image = this.addCustomerFormGroup.get('image').value
        console.log(account);

        this.accountService.insert(account).subscribe(
            data => {
                if (data) {
                    this.utilsService.updateToastState(new ToastState('Add Account Successfully!', "success"))
                    this.accountService.notifyAccountChange()
                    this.resetForm()
                    this.windowRef.close();
                } else {
                    this.utilsService.updateToastState(new ToastState('Add Account Failed!', "danger"))
                }
            },
            error => console.log(error)
        )
    }

    resetForm() {
        this.addCustomerFormGroup.reset();
        this.addCustomerFormGroup.get('active').setValue(true)
    }

    selectFile(event: any) {
        if (event.target.files) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.addCustomerFormGroup.get('image').setValue(event.target.result)
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

}