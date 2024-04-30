import { ToastState, UtilsService } from '../../../../@core/services/utils.service';
import { Component, OnInit, Input, ViewChild, TemplateRef, OnChanges, SimpleChanges } from "@angular/core";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from 'ng2-smart-table';
import { ChannelService } from '../../../../@core/services/channel/channel.service';

@Component({
    selector: 'ngx-hashtag-custom-action',
    template: `
        <div class="row no-gutters  d-flex justify-content-center">
            <div class="col-lg-6  d-flex justify-content-center">
                <button nbButton status="success" (click)="onDownload($event)">
                    <nb-icon icon="download-outline"></nb-icon>
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
                        Are you sure you want to delete this download history?
                </nb-card-header>
                <nb-card-body>
                    <button nbButton status="success" class="mt-3" (click)="deleteDownload()">
                        CONFIRM
                    </button>
                </nb-card-body>
            </nb-card>
        </ng-template>
    `,
})

export class CustomChannelDownloadActionComponent implements ViewCell, OnInit {
    @Input() value: string | number | any;
    @Input() rowData: any;
    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    constructor(
        private channelService: ChannelService,
        private windowService: NbWindowService,
        private utilsService: UtilsService
    ) { }

    ngOnInit(): void {
        console.log();
    }

    onDownload(event: MouseEvent) {
        this.channelService.downloadPostNReel(this.rowData.username, this.rowData.id)
            .subscribe(response => { // Assuming response handling is correctly done within the service
                // No additional logic needed here if downloadPostNReel handles the download
            }, error => {
                console.error('Download error:', error);
                // Optionally, handle errors or show a message to the user
            });
    }

    onDelete() {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Download` });
    }

    deleteDownload() {

    }
}