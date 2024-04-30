import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChannelService, CrawlContent } from "../../../@core/services/channel/channel.service";
import { ToastState, UtilsService } from "../../../@core/services/utils.service";
import { CustomValidator } from "../../../@core/validators/custom-validator";
import { Router } from "@angular/router";

@Component({
  selector: "ngx-channel-scrape",
  templateUrl: "./channel-scrape.component.html",
})
export class ChannelScrapeComponent implements OnInit {

  scrapeChannelsFormGroup: FormGroup;
  readonly crawls: CrawlContent[] = ["PROFILE", "FRIENDSHIPS", "POSTS", "REELS"]

  crawlContents: CrawlContent[] = []
  isCrawling: boolean = false;
  constructor(
    private channelService: ChannelService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.scrapeChannelsFormGroup = this.formBuilder.group({
      usernames: this.formBuilder.array([
        this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)])
      ]),
      crawls: this.formBuilder.group({
        PROFILE: [{ value: true, disabled: true }],  // PROFILE checkbox is checked and disabled
        FRIENDSHIPS: [false],
        POSTS: [false],
        REELS: [false],
      }),
    });
  }

  get usernames(): FormArray {
    return this.scrapeChannelsFormGroup.get('usernames') as FormArray;
  }

  addNameField() {
    this.usernames.push(this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)]));
  }

  removeNameField(index: number) {
    this.usernames.removeAt(index);
  }

  scrapeChannels() {
    if (this.scrapeChannelsFormGroup.invalid) {
      this.scrapeChannelsFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Keyword Failed!', "danger"))
      return;
    }

    this.isCrawling = true
    const username = this.usernames.at(0).value
    this.channelService.isExists(username)
      .subscribe(body => {
        if (body.data) {
          const crawlsFormGroup = this.scrapeChannelsFormGroup.get('crawls') as FormGroup;
          this.crawlContents = Object.keys(crawlsFormGroup.controls)
            .filter(key => crawlsFormGroup.get(key)?.value)
            .map(key => key as CrawlContent);
          this.utilsService.updateToastState(new ToastState(`Crawling ${this.crawlContents.join("-")} of ${username}`, "info"));

          this.channelService.crawlMulti(username, this.crawlContents)
            .subscribe(
              body => {
                if (body.statusCode == 200) {
                  console.log(body);
                  this.isCrawling = false;
                  this.router.navigate(["/admin/channels/list"])
                  this.utilsService.updateToastState(new ToastState(`Crawl Successfully in ${body.handlerTime}ms`, 'success'))
                }
              },
              error => {
                this.isCrawling = false
                this.utilsService.updateToastState(new ToastState('Error on crawling', 'danger'))
              }
            )
        } else {
          this.isCrawling = false
          this.utilsService.updateToastState(new ToastState('Channel does not exists', 'danger'))
        }
      })

    // this.createLoading = true
    // let keyword: CreateKeywordDto = {
    //   name: this.scrapeChannelsFormGroup.get('name').value,
    //   priority: this.scrapeChannelsFormGroup.get('priority').value,
    // }
    // this.channelService.insert(keyword)
    //   .pipe(
    //     catchError(error => {
    //       // Log the error or handle it as needed
    //       console.error('Error occurred while adding a keyword:', error);
    //       this.createLoading = false;
    //       this.utilsService.updateToastState(new ToastState('Failed to add keyword!', "danger"));
    //       return of(null); // Return a null observable so the stream remains alive
    //     })
    //   )
    //   .subscribe(data => {
    //     if (data) {
    //       this.createLoading = false
    //       this.keywordService.notifyKeywordChange();
    //       this.utilsService.updateToastState(new ToastState('Add Keyword Successfully!', "success"))
    //       this.reset()
    //     }
    //   })
  }

  reset() {
    this.scrapeChannelsFormGroup.reset();
  }
}
