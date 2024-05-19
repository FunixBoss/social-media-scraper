import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";

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
          all: [true],
          from_order: [1, Validators.min(1)],
          to_order: [1, Validators.min(1)],
        }),
        reels: this.formBuilder.group({
          all: [true],
          from_order: [1, Validators.min(1)],
          to_order: [1, Validators.min(1)],
        })
      })
    });
  }

  get export(): FormGroup { return this.scrapeForm.get('export') as FormGroup }
  get download(): FormGroup { return this.scrapeForm.get('download') as FormGroup }
  get postsDownloadGroup() { return this.download.get('posts') as FormGroup; }
  get reelsDownloadGroup() { return this.download.get('reels') as FormGroup; }

  validate(): boolean {
    if (this.postsDownloadGroup.get('all').value == true) {
      this.postsDownloadGroup.get('from_order').clearValidators()
      this.postsDownloadGroup.get('to_order').clearValidators()
    }
    if (this.reelsDownloadGroup.get('all').value == true) {
      this.reelsDownloadGroup.get('from_order').clearValidators()
      this.reelsDownloadGroup.get('to_order').clearValidators()
    }
    if (this.scrapeForm.invalid) {
      this.scrapeForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  reset() {
    this.scrapeForm.reset();
  }
}
