import { CATALOG_IMAGE_DIRECTORY, PRODUCT_IMAGE_DIRECTORY, SIDE_GUIDE_IMAGE_DIRECTORY, VARIANT_IMAGE_DIRECTORY } from './../../../@core/utils/image-storing-directory';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NbAccordionItemComponent, NbStepChangeEvent, NbStepperComponent } from '@nebular/theme';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../@core/services/product/product.service';
import { Product } from '../../../@core/models/product/product.model';
import { CustomValidator } from '../../../@core/validators/custom-validator';
import { ImagesCarouselComponent } from '../images-carousel.component';
import { ProductVariant } from '../../../@core/models/product/product-variant.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { ProductSale } from '../../../@core/models/sale/product-sale.model';
import { ProductSize } from '../../../@core/models/product/product-size.model';
import { Catalog } from '../../../@core/models/product/catalog.model';
import { PlantingDifficultyLevel } from '../../../@core/models/product/planting-difficulty-level.model';
import { FormBasicInformationComponent } from '../shared/form-basic-information/form-basic-information.component';
import { FormVariantsComponent } from '../shared/form-variants/form-variants.component';
import { FormCareGuideComponent } from '../shared/form-care-guide/form-care-guide.component';

@Component({
  selector: 'ngx-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss']
})
export class ProductEditComponent {
  @ViewChild(NbStepperComponent) stepper: NbStepperComponent;
  @ViewChild(FormBasicInformationComponent) basicInformationCpn: FormBasicInformationComponent;
  @ViewChild(FormVariantsComponent) variantCpn: FormVariantsComponent;
  @ViewChild(FormCareGuideComponent) careGuideCpn: FormCareGuideComponent;

  edittingProduct;
  edittingProductId: string;

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private utilsService: UtilsService,
    private router: Router,

  ) {
    this.activatedRoute.params.subscribe(
      params => {
        this.edittingProductId = params['id']
        this.productService.findById(+this.edittingProductId).subscribe(
          (data: Product) => {
            this.edittingProduct = data
            this.edittingProduct.imageUrls = this.edittingProduct.imageUrls
              .map(img => PRODUCT_IMAGE_DIRECTORY + img)
          }
        )
      }
    )
  }

  onSubmit() {
    if(!this.validate()) return;

    const product: Product = this.mapFormValue()
    console.log(product)

    this.productService.update(product).subscribe(data => {
      if (data) {
        this.utilsService.updateToastState(new ToastState('Edit Product Successfully!', "success"))
        this.router.navigate(['/admin/products/list'])
      } else {
        this.utilsService.updateToastState(new ToastState('Edit Product Failed!', "danger"))
      }
    })
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
