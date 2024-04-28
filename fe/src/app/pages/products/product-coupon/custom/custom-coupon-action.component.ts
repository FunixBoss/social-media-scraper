import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { Component, ViewChild, OnInit, Input, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { ViewCell } from "ng2-smart-table";
import { ProductCouponService } from "../../../../@core/services/product/product-coupon.service";
import { ToastState, UtilsService } from '../../../../@core/services/utils.service';

@Component({
    selector: 'ngx-custom-action',
    template: `
        <div class="row no-gutters">
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="warning" (click)="onEdit()">
                    <nb-icon icon="edit-2-outline"></nb-icon>
                </button>
            </div>
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="danger" (click)="onDelete($event)">
                    <nb-icon icon="trash-outline"></nb-icon>
                </button>
            </div>
        </div>

        <ng-template #onDeleteTemplate let-data>
            <nb-card>
                <nb-card-header>
                        Are you sure you want to delete this coupon?
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

export class CustomCouponActionComponent implements ViewCell {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private couponService: ProductCouponService,
        private windowService: NbWindowService,
        private utilsService: UtilsService,
    ) {
    }

    onEdit() {
        this.couponService.updateHandleAndRowData('edit', this.rowData);
    }

    onDelete(event: any) {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Coupon` });
    }

    deleteCoupon() {
        this.couponService.delete(this.rowData.couponId).subscribe(
            data => {
                this.deleteWindowRef.close()
                this.couponService.notifyCouponChange();
                this.utilsService.updateToastState(new ToastState('Delete Coupon Successfully!', "success"))
            },
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Coupon Failed!', "danger"))
                console.log(error);

            }
        )
    }

}