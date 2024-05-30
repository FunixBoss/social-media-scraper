import { Component, OnInit, Input, ViewChild, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from "ng2-smart-table";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { ChannelService } from "../../../../@core/services/channel/channel.service";
import { FormGroup } from "@angular/forms";
import { ScrapeOptionsFormComponent } from "../../shared/scrape-options-form/scrape-options-form.component";

@Component({
    selector: 'ngx-custom-channel-action',
    templateUrl: 'custom-channel-action.component.html',
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

export class CustomChannelActionComponent implements ViewCell, OnInit {
    username: string;
    renderValue: string;
    @Input() value: string | number;
    @Input() rowData: any;

    isCrawling: boolean = false;

    @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
    deleteWindowRef: NbWindowRef;

    @ViewChild(ScrapeOptionsFormComponent) scrapeOptionsFormComponent: ScrapeOptionsFormComponent;
    @ViewChild('crawlWindowTemplate') crawlWindow: TemplateRef<any>;
    crawlWindowRef: NbWindowRef;

    crawlFormGroup: FormGroup
    constructor(
        private windowService: NbWindowService,
        private channelService: ChannelService,
        private utilsService: UtilsService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.username = this.rowData.username;
    }

    openCrawlWindow() {
        this.crawlWindowRef = this.windowService
            .open(this.crawlWindow, { title: `Scrape Channel Options`, });
    }

    onCrawl() {
        if (!this.scrapeOptionsFormComponent.validate()) {
            this.scrapeOptionsFormComponent.scrapeForm.markAllAsTouched()
            this.utilsService.updateToastState(new ToastState('Validate Failed!', "danger"))
            return;
        }

        this.channelService.crawlOne(this.username, this.scrapeOptionsFormComponent.getChannelScraperInfo())
            .subscribe({
                next: (data) => {
                    if (data.statusCode == 200) {
                        this.utilsService.updateToastState(new ToastState(`Crawl channel successfully: ${this.username}`, "success"));
                        this.channelService.notifyChannelChange()
                        this.crawlWindowRef.close()
                    }
                },
                error: (error) => {
                    console.error('Error downloading the file', error);
                    this.utilsService.updateToastState(new ToastState(`Crawl channels failed: ${this.username}`, "danger"));
                }
            });
    }

    onExportExcel() {
        this.utilsService.updateToastState(new ToastState(`Exporting Excel of ${this.username}`, "info"));
        this.channelService.exportExcel(this.username).subscribe({
            next: (data) => {
                this.utilsService.updateToastState(new ToastState(`Export Excel of ${this.username} completed successfully`, "success"));
            },
            error: (error) => {
                console.error('Error downloading the file', error);
                this.utilsService.updateToastState(new ToastState('Failed to download Excel file', "danger"));
            }
        });
    }

    onDownload() {
        this.router.navigate(['/channels/downloads', this.rowData.username])
    }

    openDeleteWindow() {
        this.deleteWindowRef = this.windowService
            .open(this.deleteWindow, { title: `Delete Channel` });
    }

    onDelete() {
        this.channelService.delete(this.username)
            .subscribe({
                next: (data) => {
                    if (data.statusCode == 200) {
                        this.utilsService.updateToastState(new ToastState(`Delete channel ${this.username} successfully`, "success"));
                        this.channelService.notifyChannelChange()
                        this.deleteWindowRef.close()
                    }
                },
                error: (error) => {
                    console.error('Error downloading the file', error);
                    this.utilsService.updateToastState(new ToastState(`Delete channel ${this.username} failed`, "danger"));
                }
            });
    }
}