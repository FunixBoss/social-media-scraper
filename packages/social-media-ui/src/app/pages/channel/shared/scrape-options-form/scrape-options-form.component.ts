import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ChannelScraperInfo, DownloadOptions, PostNReelDownloadOptions } from '../../../../@core/models/channel-scraper-info';

@Component({
  selector: "ngx-scrape-options-form",
  templateUrl: "./scrape-options-form.component.html",
})
export class ScrapeOptionsFormComponent implements OnInit {

  scrapeForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.scrapeForm = this.formBuilder.group({
      crawl: this.formBuilder.group({
        profile: [{ value: true, disabled: true }],
        friendships: [true],
        posts: [true],
        reels: [true],
      }),
      export: this.formBuilder.group({
        json: [true],
        excel: [true]
      }),
      download: this.formBuilder.group({
        posts: this.formBuilder.group({
          option: ['download_all'],
          from_order: [{ value: 1, disabled: false }, Validators.min(1)],
          to_order: [{ value: 1, disabled: false }, Validators.min(1)],
        }),
        reels: this.formBuilder.group({
          option: ['download_all'],
          from_order: [{ value: 1, disabled: false }, Validators.min(1)],
          to_order: [{ value: 1, disabled: false }, Validators.min(1)],
        })
      })
    });
  }

  get crawl(): FormGroup { return this.scrapeForm.get('crawl') as FormGroup }
  get export(): FormGroup { return this.scrapeForm.get('export') as FormGroup }
  get download(): FormGroup { return this.scrapeForm.get('download') as FormGroup }
  get postsDownloadGroup() { return this.download.get('posts') as FormGroup; }
  get reelsDownloadGroup() { return this.download.get('reels') as FormGroup; }

  validate(): boolean {
    if (this.postsDownloadGroup.get('option').value == 'download_all' || this.postsDownloadGroup.get('option').value == 'no_download') {
      this.postsDownloadGroup.get('from_order').clearValidators()
      this.postsDownloadGroup.get('to_order').clearValidators()
    }
    if (this.reelsDownloadGroup.get('option').value == 'download_all' || this.reelsDownloadGroup.get('option').value == 'no_download') {
      this.reelsDownloadGroup.get('from_order').clearValidators()
      this.reelsDownloadGroup.get('to_order').clearValidators()
    }
    if (this.scrapeForm.invalid) {
      this.scrapeForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  getChannelScraperInfo(): ChannelScraperInfo {
    let postDownloadOptions: PostNReelDownloadOptions = this.postsDownloadGroup.get('option').value == 'download_all'
      ? { all: true }
      : this.postsDownloadGroup.get('option').value == 'no_download'
        ? undefined
        : { all: false, to_order: this.postsDownloadGroup.get('to_order').value, from_order: this.postsDownloadGroup.get('from_order').value };
    let reelDownloadOptions: PostNReelDownloadOptions = this.reelsDownloadGroup.get('option').value == 'download_all'
      ? { all: true }
      : this.reelsDownloadGroup.get('option').value == 'no_download'
        ? undefined
        : { all: false, to_order: this.reelsDownloadGroup.get('to_order').value, from_order: this.reelsDownloadGroup.get('from_order').value };
    let downloadOptions: DownloadOptions = {
      reels: reelDownloadOptions,
      posts: postDownloadOptions
    }
    const scraper = {
      crawl: this.crawl.value,
      export: this.export.value,
      download: downloadOptions
    };
    console.log(scraper);
    
    return scraper;
  }

  reset() {
    this.scrapeForm.reset();
  }
}
