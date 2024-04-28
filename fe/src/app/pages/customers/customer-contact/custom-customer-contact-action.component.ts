import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { ViewCell } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { ContactService } from '../../../@core/services/account/contact.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'ngx-custom-action',
    template: `
        <div class="row no-gutters">
            <div class="col-6 d-flex justify-content-center">
                <button nbButton status="danger" (click)="onDelete($event)">
                    <nb-icon icon="trash-outline"></nb-icon>
                </button>
            </div>
            <div class="col-6 d-flex justify-content-center">
                <button nbButton status="primary" (click)="onGetDetail($event)">
                    <nb-icon icon="folder-outline"></nb-icon>
                </button>
            </div>
        </div>

        <ng-template #detailTemplate let-data>
            <nb-card>
                <nb-card-header>
                    Contact Detail
                </nb-card-header>
                <nb-card-body>
                    <div class="row px-2 py-2" [formGroup]="contactForm">
                        <div class="col-lg-6 col-sm-12 mt-2">
                            <input type="text" nbInput fullWidth placeholder="Full Name" formControlName="fullName">
                        </div>
                        <div class="col-lg-6 col-sm-12 mt-2">
                            <input type="text" nbInput fullWidth placeholder="Email" formControlName="email">
                        </div>
                        <div class="col-lg-6 col-sm-12 mt-2">
                            <input type="text" nbInput fullWidth placeholder="Phone Number" formControlName="phoneNumber">
                        </div>
                        <div class="col-lg-6 col-sm-12 mt-2">
                            <input type="text" nbInput fullWidth placeholder="Subject" formControlName="subject">
                        </div>
                        <div class="col-12 mt-2">
                        <textarea rows="3" nbInput fullWidth placeholder="Message" formControlName="message"
                            style="resize: none"></textarea>
                        </div>
                    </div>
                </nb-card-body>
            </nb-card>
        </ng-template>

        <ng-template #onDeleteTemplate let-data>
            <nb-card>
                <nb-card-header>
                        Are you sure you want to delete this contact?
                </nb-card-header>
                <nb-card-body>
                    <button nbButton status="success" class="mt-3" (click)="deleteCoupon()">
                        CONFIRM
                    </button>
                </nb-card-body>
            </nb-card>
        </ng-template>
    `,
})

export class CustomCustomerContactActionComponent implements ViewCell {
    renderValue: string;
    contactForm: FormGroup
    @Input() value: string | number;
    @Input() rowData: any;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    @ViewChild('detailTemplate') detailWindow: TemplateRef<any>;
    detailWindowRef: NbWindowRef;

    constructor(
        private contactService: ContactService,
        private windowService: NbWindowService,
        private utilsService: UtilsService,
        private formBuilder: FormBuilder
    ) {

    }

    onGetDetail(event: any) {
        this.contactService.findById(this.rowData.contactId).subscribe(result => {
            this.contactForm = this.formBuilder.group({
                fullName: [result.fullName],
                email: [result.email],
                phoneNumber: [result.phoneNumber],
                subject: [result.subject],
                message: [result.message],
            })
            this.detailWindowRef = this.windowService
                .open(this.detailWindow, { title: `Contact Id: ${result.contactId}` });
        })
    }

    onDelete(event: any) {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Contact` });
    }

    deleteCoupon() {
        this.contactService.delete(this.rowData.contactId).subscribe(
            () => {
                this.deleteWindowRef.close()
                this.contactService.notifyContactChange();
                this.utilsService.updateToastState(new ToastState('Delete Contact Successfully!', "success"))
            },
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Contact Failed!', "danger"))
                console.log(error);

            }
        )
    }

}