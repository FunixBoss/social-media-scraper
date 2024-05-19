import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from "@angular/core";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChannelService } from "../../../../@core/services/channel/channel.service";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { ScrapeOptionsFormComponent } from "../../shared/scrape-options-form/scrape-options-form.component";

@Component({
  selector: "ngx-channels-list-multi",
  templateUrl: "./channel-list-multi.component.html",
  styleUrls: ["./channel-list-multi.component.scss"],
})
export class ChannelListMultiComponent {

  @Input() selectedChannels: any[]
  @Output() isDeleted = new EventEmitter<boolean>();
  @Output() isCrawled = new EventEmitter<boolean>();

  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  deleteWindowRef: NbWindowRef;

  @ViewChild(ScrapeOptionsFormComponent) scrapeOptionsFormComponent: ScrapeOptionsFormComponent;
  @ViewChild('crawlWindowTemplate') crawlWindow: TemplateRef<any>;
  crawlWindowRef: NbWindowRef;

  constructor(
    private windowService: NbWindowService,
    private channelService: ChannelService,
    private utilsService: UtilsService
  ) { }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Products` });
  }
  onDelete() {
    const usernames: string[] = this.selectedChannels.map(ch => ch.username)
    this.channelService.deleteMulti(usernames)
      .subscribe({
        next: (data) => {
          if (data.statusCode == 200) {
            this.utilsService.updateToastState(new ToastState(`Delete channels successfully: ${usernames.join(", ")}`, "success"));
            this.channelService.notifyChannelChange()
            this.deleteWindowRef.close()
          }
        },
        error: (error) => {
          console.error('Error downloading the file', error);
          this.utilsService.updateToastState(new ToastState(`Delete channels failed: ${usernames.join(", ")}`, "danger"));
        }
      });
  }

  openCrawlWindow() {
    this.crawlWindowRef = this.windowService
      .open(this.crawlWindow, { title: `Scrape Channels Options`, });
  }
  onCrawlMulti() {
    if (!this.scrapeOptionsFormComponent.validate()) {
      this.scrapeOptionsFormComponent.scrapeForm.markAllAsTouched()
      this.utilsService.updateToastState(new ToastState('Validate Failed!', "danger"))
      return;
    }

    const usernames: string[] = this.selectedChannels.map(ch => ch.username)
    this.channelService.crawlMulti(usernames, this.scrapeOptionsFormComponent.scrapeForm.value)
      .subscribe({
        next: (data) => {
          if (data.statusCode == 200) {
            this.utilsService.updateToastState(new ToastState(`Crawl channels successfully: ${usernames.join(", ")}`, "success"));
            this.channelService.notifyChannelChange()
          }
        },
        error: (error) => {
          console.error('Error downloading the file', error);
          this.utilsService.updateToastState(new ToastState(`Crawl channels failed: ${usernames.join(", ")}`, "danger"));
        }
      });
    this.crawlWindowRef.close()
  }
}