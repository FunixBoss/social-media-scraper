import { ToastState, UtilsService } from '../../../../@core/services/utils.service';
import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from "@angular/core";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from 'ng2-smart-table';
import { HashtagService } from '../../../../@core/services/keyword/hashtag.service';

@Component({
    selector: 'ngx-hashtag-custom-action',
    template: `
        <div class="row no-gutters  d-flex justify-content-center">
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="info" (click)="onDetail($event)">
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
                        Are you sure you want to delete this hashtag?
                </nb-card-header>
                <nb-card-body>
                    <button nbButton status="success" class="mt-3" (click)="deleteHashtag()">
                        CONFIRM
                    </button>
                </nb-card-body>
            </nb-card>
        </ng-template>
    `,
})

export class CustomHashtagActionComponent implements ViewCell, OnInit {
    @Input() value: string | number | any;
    @Input() rowData: any;
    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private hashtagService: HashtagService,
        private windowService: NbWindowService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        console.log();
    }

    onDetail(event: MouseEvent) {
        // this.hashtagService.updateHandleAndRowData('edit', this.catalogId);
    }

    onDelete() {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Hashtag` });
    }

    deleteHashtag() {
        this.hashtagService.delete(this.rowData.name).subscribe(
            data => {
                if (data) {
                    this.deleteWindowRef.close()
                    this.hashtagService.notifyHashtagChange();
                    this.utilsService.updateToastState(new ToastState('Delete Hashtag Successfully!', "success"))
                } else {
                    this.utilsService.updateToastState(new ToastState('Delete Hashtag Failed!', "danger"))
                }
            },
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Hashtag Failed!', "danger"))
                console.log(error);
            }
        )
    }
}