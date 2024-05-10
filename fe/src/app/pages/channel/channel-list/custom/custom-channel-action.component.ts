import { Component, OnInit, Input, ViewChild, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { NbDataRowOutletDirective, NbWindowRef, NbWindowService } from "@nebular/theme";
import { ViewCell } from "ng2-smart-table";
import { ProductService } from "../../../../@core/services/product/product.service";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { ChannelService } from "../../../../@core/services/channel/channel.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { Observable } from "rxjs";

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

    @ViewChild('onCrawlTemplate') crawlWindow: TemplateRef<any>;
    crawlWindowRef: NbWindowRef;
    crawlFormGroup: FormGroup
    crawlContents: string[] = ["PROFILE", "FRIENDSHIPS", "POSTS", "REELS", "ALL"]
    constructor(
        private windowService: NbWindowService,
        private channelService: ChannelService,
        private utilsService: UtilsService,
        private formBuilder: FormBuilder,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.crawlFormGroup = this.formBuilder.group({
            crawl: ['PROFILE', [CustomValidator.notBlank]],
        })
        this.username = this.rowData.username;
    }

    onCrawl(event: any) {
        this.crawlWindowRef = this.windowService
            .open(this.crawlWindow, { title: `Crawl Channel` });
    }

    crawlChannel() {
        if (this.crawlFormGroup.invalid) {
            this.crawlFormGroup.markAllAsTouched();
            this.utilsService.updateToastState(new ToastState('Crawl Channel Failed!', "danger"));
            return;
        }

        const crawlContent: string = this.crawlFormGroup.get("crawl").value;
        this.utilsService.updateToastState(new ToastState(`Crawling ${crawlContent} of ${this.username}`, "info"));
        const crawlActions = {
            'PROFILE': () => this.channelService.crawlProfile(this.username),
            'FRIENDSHIPS': () => this.channelService.crawlFriendships(this.username),
            'POSTS': () => this.channelService.crawlPosts(this.username),
            'REELS': () => this.channelService.crawlReels(this.username),
            'ALL': () => this.channelService.crawlFull(this.rowData.username)
        };
        this.executeCrawl(crawlContent, crawlActions[crawlContent]);
        this.crawlWindowRef.close();
    }

    private executeCrawl(crawlContent: string, crawlFunction: () => Observable<any>) {
        crawlFunction().subscribe(
            body => {
                if (body && (body.statusCode === 200 || body.data === null)) {
                    this.isCrawling = false;
                    this.channelService.notifyChannelChange();
                    this.utilsService.updateToastState(new ToastState(`Crawled ${crawlContent} of ${this.username} completely in ${body.handlerTime}ms`, "success"));
                }   
            },
            error => {
                this.isCrawling = false;
                console.error(error);
                this.utilsService.updateToastState(new ToastState(`Error crawling ${crawlContent} of ${this.username}`, "danger"));
            }
        );
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
        this.router.navigate(['/admin/channels/downloads', this.rowData.username])
    }
}