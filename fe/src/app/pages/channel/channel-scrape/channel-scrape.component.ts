import { Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChannelService } from "../../../@core/services/channel/channel.service";
import { ToastState, UtilsService } from "../../../@core/services/utils.service";
import { CustomValidator } from "../../../@core/validators/custom-validator";
import { Router } from "@angular/router";
import { ScrapeOptionsFormComponent } from "../shared/scrape-options-form/scrape-options-form.component";

@Component({
  selector: "ngx-channel-scrape",
  templateUrl: "./channel-scrape.component.html",
})
export class ChannelScrapeComponent implements OnInit {

  scrapeChannelsForm: FormGroup;
  isCrawling: boolean = false;
  @ViewChild(ScrapeOptionsFormComponent) scrapeOptionsFormComponent: ScrapeOptionsFormComponent;

  constructor(
    private channelService: ChannelService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.scrapeChannelsForm = this.formBuilder.group({
      usernames: this.formBuilder.array([
        this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)])
      ])
    });
  }

  get usernames(): FormArray { return this.scrapeChannelsForm.get('usernames') as FormArray; }
  addNameField() { this.usernames.push(this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)])); }
  removeNameField(index: number) { this.usernames.removeAt(index); }

  scrapeChannels() {
    if (!this.validate()) return;

    this.isCrawling = true
    this.channelService.crawlMulti(this.usernames.value, { ...this.scrapeOptionsFormComponent.scrapeForm.value })
      .subscribe(
        body => {
          if (body.statusCode == 200) {
            console.log(body);
            this.isCrawling = false;
            this.router.navigate(["/admin/channels/list"])
            this.utilsService.updateToastState(new ToastState(`Crawl users successfully in ${body.handlerTime}ms`, 'success'))
            this.isCrawling = false
          }
        },
        error => {
          this.isCrawling = false
          this.utilsService.updateToastState(new ToastState(`Error: ${error["name"]} - ${error["message"]}`, 'danger'))
        }
      )
  }

  validate(): boolean {
    if (this.scrapeChannelsForm.invalid || !this.scrapeOptionsFormComponent.validate()) {
      this.scrapeChannelsForm.markAllAsTouched();
      this.scrapeOptionsFormComponent.scrapeForm.markAllAsTouched()
      this.utilsService.updateToastState(new ToastState('Validate Failed!', "danger"))
      return false;
    }
    return true;
  }

  reset() {
    this.scrapeChannelsForm.reset();
    this.scrapeOptionsFormComponent.reset();
  }
}
