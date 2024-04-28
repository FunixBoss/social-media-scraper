import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { ProductSaleService } from "../../../../@core/services/product/product-sale.service";
import { ProductSale } from "../../../../@core/models/sale/product-sale.model";

@Component({
  selector: "ngx-products-sale-add",
  templateUrl: "./product-sale-add.component.html",
  styleUrls: ["./product-sale-add.component.scss"],
})
export class ProductSaleAddComponent implements OnInit {
  addSaleFormGroup: FormGroup;

  constructor(
    private saleService: ProductSaleService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addSaleFormGroup = this.formBuilder.group({
      name: ['', [CustomValidator.notBlank, Validators.maxLength(50)]],
      description: ['', [CustomValidator.notBlank, Validators.maxLength(50)]],
      discountType: ['', [Validators.required]],
      active: [false],
      discountValue: [, [Validators.required, CustomValidator.maxCouponValue]],
      startedAt: [, Validators.required],
      expiredAt: [, Validators.required]
    })
  }

  ngOnInit() {
    let x
  }

  submitAddSale() {
    if (this.addSaleFormGroup.invalid) {
      this.addSaleFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Product Sale Failed!', "danger"))
      return;
    }

    const sale = this.mapFormValue()
    console.log(sale);

    this.saleService.insert(sale).subscribe(
      data => {
        if (data) {
          this.utilsService.updateToastState(new ToastState('Add Product Sale Successfully!', "success"))
          this.saleService.notifyProductSaleChange()
          this.addSaleFormGroup.reset()

        }
      },
      error => {
        console.log(error.error.message)
        this.utilsService.updateToastState(new ToastState('Add Product Sale Failed!', "danger"))
      }
    )
  }

  mapFormValue(): ProductSale {
    let sale = new ProductSale();
    sale.saleName = this.addSaleFormGroup.get('name').value
    sale.discount = this.addSaleFormGroup.get('discountValue').value
    sale.description = this.addSaleFormGroup.get('description').value
    sale.productSaleType = this.saleService.findProductSaleTypeById(this.addSaleFormGroup.get('discountType').value == 'Fixed' ? 1 : 2);
    sale.active = this.addSaleFormGroup.get('active').value
    sale.startedAt = this.addSaleFormGroup.get('startedAt').value
    sale.expiredAt = this.addSaleFormGroup.get('expiredAt').value
    return sale;
  }

}