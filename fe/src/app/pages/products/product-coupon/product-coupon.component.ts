import { ProductCouponService } from './../../../@core/services/product/product-coupon.service';
import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { CustomCouponFilterActionsComponent } from "./custom/custom-coupon-filter-actions.component";
import { CustomCouponActionComponent } from "./custom/custom-coupon-action.component";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { Coupon } from '../../../@core/models/coupon/coupon.model';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';

@Component({
  selector: "ngx-products-coupon",
  templateUrl: "./product-coupon.component.html",
  styleUrls: ["./product-coupon.component.scss"],
})
export class ProductCouponComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  state: string = "add"; // default
  loadedCoupons: boolean = false;
  
  // for deleting multi coupon
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  selectedCoupons: Coupon[] = []
  deleteWindowRef: NbWindowRef;

  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 10; // default
  source: LocalDataSource = new LocalDataSource();
  settings = {
    selectMode: 'multi',
    actions: {
      edit: false,
      delete: false,
      add: false,
      columnTitle: ''
    },
    mode: "external", // when add/edit -> navigate to another url
    columns: {
      couponId: {
        title: "ID",
        type: "number",
        width: '3%'
      },
      code: {
        title: "Code",
        type: "string",
      },
      description: {
        title: "Description",
        type: "string",
      },
      discount: {
        title: "Discount",
        type: "string",
      },
      startedAt: {
        title: 'Started Date',
        type: 'string'
      },
      expiredAt: {
        title: 'Expired Date',
        type: 'string'
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomCouponFilterActionsComponent
        },
        renderComponent: CustomCouponActionComponent
      }
    },
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private couponService: ProductCouponService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
  ) {
    this.couponService.couponChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadCoupons();
      });
    this.loadCoupons()
  }

  loadCoupons() {
    this.couponService.findAll().subscribe(
      data => {
        const mappedCoupons = data._embedded.coupons.map((coupon) => {
          return {
            couponId: coupon.couponId,
            code: coupon.code,
            description: coupon.description,
            discount: coupon.couponType.couponTypeId == 1 ? '$' + coupon.discount : coupon.discount + '%',
            startedAt: new DatePipe('en-US').transform(coupon.startedAt, 'dd/MM/yyyy').toString(),
            expiredAt: new DatePipe('en-US').transform(coupon.expiredAt, 'dd/MM/yyyy').toString()
          }
        })
        this.source.load(mappedCoupons)
        this.loadedCoupons = true
      }
    )
  }

  ngOnInit() {
    this.couponService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  onRowSelect(event: any): void {
    this.selectedCoupons = (event.selected) as Coupon[]
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Coupons` });
  }

  onDeleteCoupons() {
    this.couponService.deleteCoupons(this.selectedCoupons).subscribe(
      data => {
        this.selectedCoupons = []
        this.deleteWindowRef.close()
        this.couponService.notifyCouponChange();
        this.utilsService.updateToastState(new ToastState('Delete The Coupons Successfully!', "success"))
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Delete The Coupons Failed!', "danger"))
        console.log(error);
      }
    )
  }
}
