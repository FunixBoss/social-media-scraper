import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { CreateKeywordDto } from "../../../../@core/models/keyword/create-keyword.dto";
import { KeywordService } from "../../../../@core/services/keyword/keyword.service";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "ngx-keyword-add",
  templateUrl: "./keyword-add.component.html",
  styleUrls: ["./keyword-add.component.scss"],
})
export class KeywordAddComponent {

  addKeywordFormGroup: FormGroup;
  priories: String[] = ["HIGH", "MEDIUM", "LOW"]
  createLoading = false;

  constructor(
    private keywordService: KeywordService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addKeywordFormGroup = this.formBuilder.group({
      name: ['', [CustomValidator.notBlank, Validators.maxLength(100)]],
      priority: ['', [CustomValidator.notBlank, Validators.maxLength(500)]],
    })
  }

  createKeyword() {
    if (this.addKeywordFormGroup.invalid) {
      this.addKeywordFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Keyword Failed!', "danger"))
      return;
    }

    this.createLoading = true
    let keyword: CreateKeywordDto = {
      name: this.addKeywordFormGroup.get('name').value,
      priority: this.addKeywordFormGroup.get('priority').value,
    }
    this.keywordService.insert(keyword)
      .pipe(
        catchError(error => {
          // Log the error or handle it as needed
          console.error('Error occurred while adding a keyword:', error);
          this.createLoading = false;
          this.utilsService.updateToastState(new ToastState('Failed to add keyword!', "danger"));
          return of(null); // Return a null observable so the stream remains alive
        })
      )
      .subscribe(data => {
        if (data) {
          this.createLoading = false
          this.keywordService.notifyKeywordChange();
          this.utilsService.updateToastState(new ToastState('Add Keyword Successfully!', "success"))
          this.reset()
        }
      })
  }

  reset() {
    this.addKeywordFormGroup.reset();
  }
}
