import { Component, ViewChild } from '@angular/core';
import { ProductService } from '../../../@core/services/product/product.service';
import { Product } from '../../../@core/models/product/product.model';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { Router } from '@angular/router';
import { FormBasicInformationComponent } from '../shared/form-basic-information/form-basic-information.component';
import { FormVariantsComponent } from '../shared/form-variants/form-variants.component';
import { FormCareGuideComponent } from '../shared/form-care-guide/form-care-guide.component';
import { NbStepChangeEvent, NbStepperComponent } from '@nebular/theme';

@Component({
  selector: 'ngx-channel-add',
  templateUrl: './channel-add.component.html',
  styleUrls: ['./channel-add.component.scss']
})
export class ChannelAddComponent {
  @ViewChild(NbStepperComponent) stepper: NbStepperComponent;
  @ViewChild(FormBasicInformationComponent) basicInformationCpn: FormBasicInformationComponent;
  @ViewChild(FormVariantsComponent) variantCpn: FormVariantsComponent;
  @ViewChild(FormCareGuideComponent) careGuideCpn: FormCareGuideComponent;

  constructor(
    private productService: ProductService,
    private utilsService: UtilsService,
    private router: Router
  ) { }


  onSubmit() {
    if(!this.validate()) return;

    const product: Product = this.mapFormValue()
    this.productService.insert(product).subscribe(
      data => {
        if (data) {
          this.utilsService.updateToastState(new ToastState('Add Product Successfully!', 'success'))
          this.router.navigate(['/admin/products/list'])
        } else {
          this.utilsService.updateToastState(new ToastState('Add Product Failed!', 'danger'))
        }
      },
      error => {
        console.log(error);
        this.utilsService.updateToastState(new ToastState('Add Product Failed!', 'danger'))
      }  
    )
  }

  validate(): boolean {
    if (this.basicInformationCpn.productForm.invalid ||
        this.variantCpn.variantsForm.invalid || 
        this.careGuideCpn.careGuideForm.invalid   
    ) {
      this.basicInformationCpn.productForm.markAllAsTouched();
      this.variantCpn.variantsForm.markAllAsTouched();
      this.careGuideCpn.careGuideForm.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Product Failed!', 'danger'))
      return false;
    }
    return true;
  }


  mapFormValue(): Product {
    let product: Product = this.basicInformationCpn.getFormValue();
    product.productCareGuide = this.careGuideCpn.getFormValue();
    product.productVariants = this.variantCpn.getVariantsValue();
    product.imageSizeGuide = this.variantCpn.getImgSizeGuideValue();
    return product;
  }

  stepChange(event: NbStepChangeEvent) {
    if(event.index == 1 && event.previouslySelectedIndex == 0) {
      if (this.basicInformationCpn.productForm.invalid) {
        this.basicInformationCpn.productForm.markAllAsTouched()
        this.stepper.previous()
        return;
      }
    } else if(event.index == 2 && event.previouslySelectedIndex == 1) {
      if (this.variantCpn.variantsForm.invalid) {
        this.variantCpn.variantsForm.markAllAsTouched()
        this.stepper.previous()
        return;
      }
    }
  }
}

