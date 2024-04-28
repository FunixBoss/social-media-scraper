import { ToastState, UtilsService } from '../../../../@core/services/utils.service';
import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from "@angular/core";
import { CatalogService } from "../../../../@core/services/product/product-catalog.service";
import { NbWindowRef, NbWindowService } from "@nebular/theme";

@Component({
    selector: 'ngx-catalog-custom-action',
    template: `
        <div class="row no-gutters  d-flex justify-content-center">
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="warning" (click)="onEdit($event)">
                    <nb-icon icon="edit-2-outline"></nb-icon>
                </button>
            </div>
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="danger" (click)="onDelete()">
                    <nb-icon icon="trash-outline"></nb-icon>
                </button>
            </div>
        </div>

        <ng-template #onDeleteTemplate let-data>
            <nb-card>
                <nb-card-header>
                        Are you sure you want to delete this catalog?
                </nb-card-header>
                <nb-card-body>
                    <button nbButton status="success" class="mt-3" (click)="deleteCatalog()">
                        CONFIRM
                    </button>
                </nb-card-body>
            </nb-card>
        </ng-template>
    `,
})

export class CustomCatalogActionComponent {

    @Input() catalogId: number;
    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private catalogService: CatalogService,
        private windowService: NbWindowService,
        private utilsService: UtilsService
    ) { }

    onEdit(event: MouseEvent) {
        this.catalogService.updateHandleAndRowData('edit', this.catalogId);
    }

    onDelete() {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Product` });
    }

    deleteCatalog() {
        this.catalogService.delete(this.catalogId).subscribe(
            data => {
                if (data) {
                    this.deleteWindowRef.close()
                    this.catalogService.notifyCatalogChange();
                    this.utilsService.updateToastState(new ToastState('Delete Catalog Successfully!', "success"))
                } else {
                    this.utilsService.updateToastState(new ToastState('Delete Catalog Failed!', "danger"))
                }
            },
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Catalog Failed!', "danger"))
                console.log(error);
            }
        )
    }
}