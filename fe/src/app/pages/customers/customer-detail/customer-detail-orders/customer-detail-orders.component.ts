import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ProductReview } from '../../../../@core/models/product/product-review.model';
import { ACCOUNT_IMAGE_DIRECTORY } from '../../../../@core/utils/image-storing-directory';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Order } from '../../../../@core/models/order/order.model';

@Component({
  selector: 'ngx-customer-detail-orders',
  templateUrl: './customer-detail-orders.component.html',
})
export class CustomerDetailOrdersComponent implements OnChanges {
  @Input() orders: Order[]
  filteredOrders: Order[]
  filterMode: boolean

  isOrdersAvailable = false;
  searchFormGroup: FormGroup
  constructor(
    private formBuilder: FormBuilder
  ) {
    this.searchFormGroup = formBuilder.group({
      trackingNumber: [''],
      sort: [null],
      filterStatus: [null],
      filterPayment: [null]
    })
    this.onSearchTrackingNumber()
  }

  onFilterAny(controlChangeName: string) {
    (controlChangeName != 'trackingNumber') ? this.searchFormGroup.get('trackingNumber').reset() : 1;
    (controlChangeName != 'sort') ? this.searchFormGroup.get('sort').reset() : 1;
    (controlChangeName != 'filterStatus') ? this.searchFormGroup.get('filterStatus').reset() : 1;
    (controlChangeName != 'filterPayment') ? this.searchFormGroup.get('filterPayment').reset() : 1;
  }

  onSearchTrackingNumber() {
    this.searchFormGroup.get('trackingNumber').valueChanges.subscribe(data => {
      this.onFilterAny('trackingNumber')
      if (data == '') {
        this.filterMode = false
      } else {
        this.filterMode = true
        this.filteredOrders = [...this.orders].filter(order => order.orderTrackingNumber.startsWith(data))
      }
    })
  }

  onSort(event: any) {
    this.onFilterAny('sort')
    this.searchFormGroup.get('sort').setValue(event)
    if (event == null) {
      this.filterMode = false
    } else {
      this.filterMode = true
      if (event == 'Newest') {
        this.filteredOrders = [...this.orders].sort((o1, o2) =>
          (new Date(o1.createdAt).getTime() < new Date(o2.createdAt).getTime()) ? 1 : -1)
      } else if (event == 'Total Price') {
        this.filteredOrders = [...this.orders].sort((o1, o2) => {
          return (o2.totalPrice > o1.totalPrice) ? 1 : -1
        })
      }
    }
  }

  onFilterStatus(event: any) {
    this.onFilterAny('filterStatus')
    this.searchFormGroup.get('filterStatus').setValue(event)
    if (event == null) {
      this.filterMode = false
    } else {
      this.filterMode = true
      this.filteredOrders = [...this.orders].filter((o) => {
        return o.orderStatus.statusName == event
      })
    }
  }

  onFilterPayment(event: any) {
    this.onFilterAny('filterPayment')
    this.searchFormGroup.get('filterPayment').setValue(event)
    if (event == null) {
      this.filterMode = false
    } else {
      this.filterMode = true
      this.filteredOrders = [...this.orders].filter((o) => {
        return o.paymentMethod.methodName == event
      })
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.orders && this.orders) {
      this.isOrdersAvailable = true;
    } else {
      this.isOrdersAvailable = false;
    }
  }
}
