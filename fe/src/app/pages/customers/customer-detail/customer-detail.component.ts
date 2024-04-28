import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../@core/services/account/account.service';
import { Account } from '../../../@core/models/account/account.model';
import { ProductReview } from '../../../@core/models/product/product-review.model';

@Component({
  selector: 'ngx-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent {
  account: Account;
  comments: ProductReview[];
  numberOfComments


  constructor(
    private activatedRoute: ActivatedRoute,
    private accountService: AccountService,
  ) {
    this.activatedRoute.params.subscribe(
      params => {
        this.accountService.findById(+params['id']).subscribe(
          (data: Account) => {
            this.account = data
            this.numberOfComments = this.account.productReviews.length
          }
        )
      }
    )
  }
}
