import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../@core/models/product/product.model';

@Component({
  selector: 'ngx-form-care-guide',
  templateUrl: './form-care-guide.component.html',
  styleUrls: ['./form-care-guide.component.scss']
})
export class FormCareGuideComponent implements OnChanges{

  careGuideForm: FormGroup
  @Input() mode: string;
  @Input() product: Product

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.careGuideForm = this.formBuilder.group({
      productId: [],
      watering: [null, [Validators.maxLength(500)]],
      light: [null, [Validators.maxLength(500)]],
      nutrition: [null, [Validators.maxLength(500)]],
      cleaning: [null, [Validators.maxLength(500)]],
      pruning: [null, [Validators.maxLength(500)]],
      bugs: [null, [Validators.maxLength(500)]],
      trouble: [null, [Validators.maxLength(500)]],
      warning: [null, [Validators.maxLength(500)]],
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode === 'edit' && this.product != null) {
      this.fillFormValue();
    }
  }

  fillFormValue() {
    this.careGuideForm.setValue(this.product.productCareGuide)
  }

  getFormValue() {
    return this.careGuideForm.value
  }

}
