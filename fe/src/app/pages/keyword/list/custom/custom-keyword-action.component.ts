import { ToastState, UtilsService } from '../../../../@core/services/utils.service';
import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from "@angular/core";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { KeywordService } from '../../../../@core/services/keyword/keyword.service';
import { ViewCell } from 'ng2-smart-table';
import { Router } from '@angular/router';

@Component({
    selector: 'ngx-keyword-custom-action',
    template: `
        <div class="row no-gutters justify-content-center">
            <div class="col-3 d-flex justify-content-center">
                <button nbButton status="danger" (click)="onDelete()">
                    <nb-icon icon="trash-outline"></nb-icon>
                </button>
            </div>
        </div>

        <ng-template #onDeleteTemplate let-data>
            <nb-card>
                <nb-card-header>
                        Are you sure you want to delete this keyword?
                </nb-card-header>
                <nb-card-body>
                    <button nbButton status="success" class="mt-3" (click)="deleteKeyword()">
                        CONFIRM
                    </button>
                </nb-card-body>
            </nb-card>
        </ng-template>
    `,
})

export class CustomKeywordActionComponent implements ViewCell, OnInit {
    @Input() value: string | number | any;
    @Input() rowData: any;
    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private keywordService: KeywordService,
        private windowService: NbWindowService,
        private utilsService: UtilsService,
        private router: Router,

    ) { }

    ngOnInit(): void {
        console.log();
    }

    onDelete() {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Keyword` });
    }

    deleteKeyword() {
        this.keywordService.delete(this.rowData.name).subscribe(
            data => {
                if (data) {
                    this.deleteWindowRef.close()
                    this.keywordService.notifyKeywordChange();
                    this.utilsService.updateToastState(new ToastState('Delete Keyword Successfully!', "success"))
                } else {
                    this.utilsService.updateToastState(new ToastState('Delete Keyword Failed!', "danger"))
                }
            },
            error => {
                this.utilsService.updateToastState(new ToastState('Delete Keyword Failed!', "danger"))
                console.log(error);
            }
        )
    }
}