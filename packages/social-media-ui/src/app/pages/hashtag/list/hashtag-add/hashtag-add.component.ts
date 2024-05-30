import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { CreateHashtagDto } from "../../../../@core/models/hashtag/create-hashtag.dto";
import { HashtagService } from "../../../../@core/services/keyword/hashtag.service";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "ngx-hashtag-add",
  templateUrl: "./hashtag-add.component.html",
  styleUrls: ["./hashtag-add.component.scss"],
})
export class HashtagAddComponent {

  addHashtagFormGroup: FormGroup;
  priories: String[] = ["HIGH", "MEDIUM", "LOW"]
  createLoading = false;

  constructor(
    private hashtagService: HashtagService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addHashtagFormGroup = this.formBuilder.group({
      name: ['', [CustomValidator.notBlank, Validators.maxLength(100)]],
      priority: ['', [CustomValidator.notBlank, Validators.maxLength(500)]],
    })
  }

  createHashtag() {
    if (this.addHashtagFormGroup.invalid) {
      this.addHashtagFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Hashtag Failed!', "danger"))
      return;
    }

    this.createLoading = true
    let hashtag: CreateHashtagDto = {
      name: this.addHashtagFormGroup.get('name').value,
      priority: this.addHashtagFormGroup.get('priority').value,
    }
    this.hashtagService.insert(hashtag)
      .pipe(
        catchError(error => {
          // Log the error or handle it as needed
          console.error('Error occurred while adding a hashtag:', error);
          this.createLoading = false;
          this.utilsService.updateToastState(new ToastState('Failed to add hashtag!', "danger"));
          return of(null); // Return a null observable so the stream remains alive
        })
      )
      .subscribe(data => {
        if (data) {
          this.createLoading = false
          this.hashtagService.notifyHashtagChange();
          this.utilsService.updateToastState(new ToastState('Add Hashtag Successfully!', "success"))
          this.reset()
        }
      })
  }

  reset() {
    this.addHashtagFormGroup.reset();
  }
}
