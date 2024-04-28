import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ProductCouponService } from "../../../../@core/services/product/product-coupon.service";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { Coupon } from "../../../../@core/models/coupon/coupon.model";

@Component({
  selector: "ngx-products-coupon-add",
  templateUrl: "./product-coupon-add.component.html",
  styleUrls: ["./product-coupon-add.component.scss"],
})
export class ProductCouponAddComponent implements OnInit {
  selectedDiscountType;
  addCouponFormGroup: FormGroup;

  constructor(
    private couponService: ProductCouponService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addCouponFormGroup = this.formBuilder.group({
      code: ['', [CustomValidator.notBlank, Validators.maxLength(20)]],
      description: ['', [CustomValidator.notBlank, Validators.maxLength(50)]],
      discountType: ['', [Validators.required]],
      discountValue: [, [Validators.required, CustomValidator.maxCouponValue]],
      startedDate: [, Validators.required],
      expiredDate: [, Validators.required]
    })
  }

  ngOnInit() {
    let x
  }

  submitAddCoupon() {
    if (this.addCouponFormGroup.invalid) {
      this.addCouponFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Coupon Failed!', "danger"))
      return;
    }

    const coupon = this.mapFormValue()
    console.log(coupon);

    this.couponService.insert(coupon).subscribe(
      data => {
        if (data) {
          this.utilsService.updateToastState(new ToastState('Add Coupon Successfully!', "success"))
          this.couponService.notifyCouponChange()
          this.addCouponFormGroup.reset()
        }
      },
      error => {
        console.log(error.error.message)
        this.utilsService.updateToastState(new ToastState('Add Coupon Failed!', "danger"))
      }
    )
  }

  mapFormValue(): Coupon {
    let coupon: any = new Coupon();
    coupon.code = this.addCouponFormGroup.get('code').value
    coupon.discount = this.addCouponFormGroup.get('discountValue').value
    coupon.description = this.addCouponFormGroup.get('description').value
    coupon.couponType = this.couponService.findCouponTypeById(this.addCouponFormGroup.get('discountType').value == 'Fixed' ? 1 : 2);
    coupon.startedAt = this.addCouponFormGroup.get('startedDate').value
    coupon.expiredAt = this.addCouponFormGroup.get('expiredDate').value
    return coupon;
  }
}