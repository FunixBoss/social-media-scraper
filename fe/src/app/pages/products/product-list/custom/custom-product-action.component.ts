import { Component, OnInit, Input, ViewChild, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NbDataRowOutletDirective, NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from "ng2-smart-table";
import { ProductService } from "../../../../@core/services/product/product.service";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";

@Component({
    selector: 'ngx-custom-action',
    templateUrl: 'custom-product-action.component.html',
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

export class CustomProductActionComponent implements ViewCell, OnInit {
    renderValue: string;

    @Input() value: string | number;
    @Input() rowData: any;

    productId: number;

    @ViewChild('onHideTemplate') hideWindow: TemplateRef<any>;
    hideWindowRef: NbWindowRef;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private router: Router,
        private windowService: NbWindowService,
        private productService: ProductService,
        private utilsService: UtilsService
    ) {
        
    }
    
    ngOnInit(): void {
        this.productId = this.rowData.productId
    }

    isHide(): boolean {
        return this.rowData.isHide === 1;
    }

    onGetDetail() {
        this.router.navigate(['/admin/products', 'detail', this.rowData.productId])
    }

    onEdit() {
        this.router.navigate(['/admin/products', 'edit', this.rowData.productId])
    }

    onDelete(event: any) {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Product` }); 
    }

    deleteProduct() {
        this.productService.delete(this.productId).subscribe(
            data => {
                if (data) {
                    this.utilsService.updateToastState(new ToastState('Delete Product Successfully!', "success"))
                    this.deleteWindowRef.close()
                    this.productService.notifyProductChange();
                } else {
                    this.utilsService.updateToastState(new ToastState('Delete Product Failed!', "danger"))
                }
            }, 
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Product Failed!', "danger"))
            }
        )
    }
}