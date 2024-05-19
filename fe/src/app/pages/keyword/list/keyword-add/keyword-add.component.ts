import { Component } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
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

  addKeywordsFormGroup: FormGroup;
  createLoading = false;

  constructor(
    private keywordService: KeywordService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addKeywordsFormGroup = this.formBuilder.group({
      names: this.formBuilder.array([
        this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)])
      ]),
    })
  }

  get names(): FormArray {
    return this.addKeywordsFormGroup.get('names') as FormArray;
  }

  addNameField() {
    this.names.push(this.formBuilder.control('', [CustomValidator.notBlank, Validators.maxLength(200)]));
  }

  removeNameField(index: number) {
    this.names.removeAt(index);
  }

  createKeyword() {
    console.log(this.addKeywordsFormGroup.errors);
    
    if (this.addKeywordsFormGroup.invalid) {
      this.addKeywordsFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Keyword Failed!', "danger"))
      return;
    }

    this.createLoading = true
    let keywords: string[] = this.names.value;
    console.log(keywords);
    
    this.keywordService.createMulti(keywords)
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
          this.utilsService.updateToastState(new ToastState('Add Keywords Successfully!', "success"))
          this.reset()
        }
      })
  }

  reset() {
    this.addKeywordsFormGroup.reset();
  }
}
