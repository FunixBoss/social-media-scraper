import { OnInit } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile } from 'rxjs/operators';
import { AccountService } from '../../@core/services/account/account.service';
import { ProductService } from '../../@core/services/product/product.service';
import { OrderService } from '../../@core/services/order/order.service';
import { forkJoin } from 'rxjs';


interface CardSettings {
  title: string;
  iconClass: string;
  type: string;
  value: number;
}

@Component({
  selector: 'ngx-dashboad',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy{
  private alive = true;

  accountCard: CardSettings = {
    title: 'Registered Users',
    iconClass: 'person-add-outline',
    type: 'primary',
    value: 0
  };
  productCard: CardSettings = {
    title: 'Total Products',
    iconClass: 'archive-outline',
    type: 'success',
    value: 0
  };
  orderCard: CardSettings = {
    title: 'Completed Orders',
    iconClass: 'file-text-outline',
    type: 'info',
    value: 0
  };
  soldCard: CardSettings = {
    title: 'Total Sold',
    iconClass: 'car',
    type: 'warning',
    value: 0
  };

  statusCards: string;

  commonStatusCardsSet: CardSettings[] = [
    this.accountCard,
    this.productCard,
    this.orderCard,
    this.soldCard,
  ];

  statusCardsByThemes: {
    default: CardSettings[];
    cosmic: CardSettings[];
    corporate: CardSettings[];
    dark: CardSettings[];
  } = {
    default: this.commonStatusCardsSet,
    cosmic: this.commonStatusCardsSet,
    corporate: [
      {
        ...this.accountCard,
        type: 'warning',
      },
      {
        ...this.productCard,
        type: 'primary',
      },
      {
        ...this.orderCard,
        type: 'danger',
      },
      {
        ...this.soldCard,
        type: 'info',
      },
    ],
    dark: this.commonStatusCardsSet,
  };

  constructor(
    private themeService: NbThemeService,
    private accountService: AccountService,
    private productService: ProductService,
    private orderService: OrderService
    ) {
    this.themeService.getJsTheme()
      .pipe(takeWhile(() => this.alive))
      .subscribe(theme => {
        this.statusCards = this.statusCardsByThemes[theme.name];
    });
  }

  ngOnInit() {
    const account$ = this.accountService.count()
    const product$ = this.productService.count()
    const order$ = this.orderService.count()
    const sold$ = this.orderService.countSold()

    forkJoin([account$, product$, order$, sold$]).subscribe(([accountData, productData, orderData, soldData]) => {
      this.accountCard.value = accountData
      this.productCard.value = productData
      this.orderCard.value = orderData
      this.soldCard.value = soldData
    })
  }
  ngOnDestroy() {
    this.alive = false;
  }
}
