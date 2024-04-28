import { Component, OnInit, ViewChildren, QueryList, AfterViewInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbAccordionItemComponent, NbRouteTab, NbRouteTabsetComponent } from '@nebular/theme';
import { ProductVariant } from '../../../../@core/models/product/product-variant.model';
import { Image } from '../../../../@core/models/Image';
import { ProductSize } from '../../../../@core/models/product/product-size.model';
import { ProductSizeService } from '../../../../@core/services/product/product-size.service';
import { forkJoin } from 'rxjs';
import { Product } from '../../../../@core/models/product/product.model';
import { SIDE_GUIDE_IMAGE_DIRECTORY, VARIANT_IMAGE_DIRECTORY } from '../../../../@core/utils/image-storing-directory';

@Component({
  selector: 'ngx-form-variants',
  templateUrl: './form-variants.component.html',
  styleUrls: ['./form-variants.component.scss']
})
export class FormVariantsComponent implements OnInit, AfterViewInit {
  @ViewChildren(NbAccordionItemComponent) accordions: QueryList<NbAccordionItemComponent>;

  variantsForm: FormGroup
  sizes: ProductSize[]

  @Input() mode: string;
  @Input() product: Product

  constructor(
    private formBuilder: FormBuilder,
    private sizeService: ProductSizeService,
  ) {
    this.variantsForm = this.formBuilder.group({
      variants: this.formBuilder.array([]),
      imgSizeGuide: [null],
    })
  }

  get variants() { return this.variantsForm.controls["variants"] as FormArray }
  get imgSizeGuide() { return this.variantsForm.controls["imgSizeGuide"] }

  ngOnInit(): void {
    const size$ = this.sizeService.findAll();
    forkJoin([size$]).subscribe(([sizeData]) => {
      this.sizes = sizeData._embedded.productSizes.map(size => {
        return {
          productSizeId: size.productSizeId,
          sizeName: size.sizeName
        }
      })
      if(this.mode == 'edit' && this.product != null) {
        this.fillFormValue()
      } else {
        this.addVariant()
      }
    })
  }

  fillFormValue() {
    this.variantsForm.get('imgSizeGuide').setValue(SIDE_GUIDE_IMAGE_DIRECTORY + this.product.imageSizeGuideUrl)

    if (this.product.productVariants.length == 0 ||
      this.product.productVariants == null) {
      this.addVariant();
      return;
    }

    for (let i = 0; i < this.product.productVariants.length; i++) {
      this.addVariant()
      let variantForm: FormGroup = this.variants.at(i) as FormGroup
      
      const variant = this.product.productVariants[i];
      variantForm.get('id').setValue(variant.productVariantId)
      variantForm.get('height').setValue(variant.height)
      variantForm.get('width').setValue(variant.width)
      variantForm.get('quantity').setValue(variant.quantity)
      variantForm.get('price').setValue(variant.price)
      const SIZE = this.sizes.find(s => s.productSizeId == variant.productSize.productSizeId)
      variantForm.get('size').setValue(SIZE)

      if (variant.imageUrl != null) {
        variantForm.get('image').setValue(VARIANT_IMAGE_DIRECTORY + variant.imageUrl);
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.accordions.first.toggle()
    }, 1000);
  }

  addVariant(event?: Event): void {
    event != undefined ? event.preventDefault() : "";
    const variantForm = this.formBuilder.group({
      id: [],
      price: [, [Validators.required, Validators.min(1), Validators.max(10000)]],
      quantity: [, [Validators.required, Validators.min(1), Validators.max(100000)]],
      height: [, [Validators.required, Validators.min(1), Validators.max(100000)]],
      width: [, [Validators.required, Validators.min(1), Validators.max(100000)]],
      size: [null, [Validators.required]],
      image: [null]
    })
    this.variants.push(variantForm)
  }

  removeVariant(variantIndex: number, event?: Event): void {
    event.preventDefault()
    this.variants.removeAt(variantIndex)
  }

  // for variants
  selectFile(event: any, variantIndex: number) {
    if (event.target.files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.variants.controls[variantIndex].get('image').setValue(event.target.result)
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  // for size guide
  selectFileSizeGuide(event: any) {
    if (event.target.files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.variantsForm.get('imgSizeGuide').setValue(event.target.result)
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  getVariantsValue(): ProductVariant[] {
    const productVariants: ProductVariant[] = this.variants.controls.map(variantForm => {
      return {
        productVariantId: variantForm.get('id').value ?? null,
        height: +variantForm.get('height').value,
        width: +variantForm.get('width').value,
        price: +variantForm.get('price').value,
        quantity: +variantForm.get('quantity').value,
        productSize: variantForm.get('size').value,
        image: (variantForm.get('image').value != null)
          ? { imageId: null, imageUrl: variantForm.get('image').value }
          : null
      };
    });
    return productVariants;
  }

  getImgSizeGuideValue(): Image {
    return {
      imageId: null,
      imageUrl: this.variantsForm.get("imgSizeGuide").value
    }
  }

}
