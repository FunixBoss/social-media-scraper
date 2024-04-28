import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Product } from '../../../../@core/models/product/product.model';
import { Account } from '../../../../@core/models/account/account.model';
import { AddressService } from '../../../../@core/services/account/address.service';

@Component({
  selector: 'ngx-customer-detail-basic',
  templateUrl: './customer-detail-basic.component.html',
  styleUrls: ['./customer-detail-basic.component.scss']
})
export class CustomerDetailBasicComponent implements OnChanges{
  @Input() account: Account
  isAccountAvailable = false;
  constructor(
    public addressService: AddressService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.account && this.account) {
      this.isAccountAvailable = true;
    } else {
      this.isAccountAvailable = false;
    }
  }

}
