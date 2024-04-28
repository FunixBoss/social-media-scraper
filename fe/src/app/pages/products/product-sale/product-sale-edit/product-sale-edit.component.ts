import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { ProductSale } from "../../../../@core/models/sale/product-sale.model";
import { ProductSaleService } from "../../../../@core/services/product/product-sale.service";

@Component({
  selector: "ngx-products-sale-edit",
  templateUrl: "./product-sale-edit.component.html",
  styleUrls: ["./product-sale-edit.component.scss"],
})
export class ProductSaleEditComponent implements OnInit {
  editSaleFormGroup: FormGroup;

  constructor(
    private saleService: ProductSaleService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.editSaleFormGroup = this.formBuilder.group({
      id: [],
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
    this.saleService.rowData$.subscribe((rowData) => {
      if (rowData) {
        this.editSaleFormGroup.get('id').setValue(rowData.productSaleId)
        this.editSaleFormGroup.get('name').setValue(rowData.saleName)
        this.editSaleFormGroup.get('description').setValue(rowData.description)
        if (rowData.discount.toString().indexOf('%') > -1) {
          this.editSaleFormGroup.get('discountType').setValue('Percent')
          this.editSaleFormGroup.get('discountValue').setValue(+rowData.discount.toString().slice(0, -1))
        } else {
          this.editSaleFormGroup.get('discountType').setValue('Fixed')
          this.editSaleFormGroup.get('discountValue').setValue(+rowData.discount.toString().slice(1))
        }
        this.editSaleFormGroup.get('startedAt')
          .setValue(this.utilsService.parseStringToDate(rowData.startedAt.toString()))
        this.editSaleFormGroup.get('expiredAt')
          .setValue(this.utilsService.parseStringToDate(rowData.expiredAt.toString()))
        this.editSaleFormGroup.get('active').setValue(rowData.active)

      }
    });
  }

  submitEditSale() {
    if (this.editSaleFormGroup.invalid) {
      this.editSaleFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Edit Product Sale Failed!', "danger"))
      return;
    }

    const sale = this.mapFormValue();
    console.log(sale);

    this.saleService.update(sale).subscribe(
      data => {
        if (data) {
          this.utilsService.updateToastState(new ToastState('Edit Product Sale Successfully!', "success"))
          this.saleService.updateHandleAndRowData('add');
          this.saleService.notifyProductSaleChange();
        } else {
          this.utilsService.updateToastState(new ToastState('Edit Product Sale Failed!', "danger"))
        }
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Edit Product Sale Failed!', "danger"))
        console.log(error)
      }
    )
  }

  mapFormValue(): ProductSale {
    let sale: ProductSale = new ProductSale();
    sale.productSaleId = this.editSaleFormGroup.get('id').value
    sale.saleName = this.editSaleFormGroup.get('name').value
    sale.discount = this.editSaleFormGroup.get('discountValue').value
    sale.description = this.editSaleFormGroup.get('description').value
    sale.productSaleType = this.saleService.findProductSaleTypeById(this.editSaleFormGroup.get('discountType').value == 'Fixed' ? 1 : 2);
    sale.active = this.editSaleFormGroup.get('active').value
    sale.startedAt = this.editSaleFormGroup.get('startedAt').value
    sale.expiredAt = this.editSaleFormGroup.get('expiredAt').value
    return sale
  }
}
