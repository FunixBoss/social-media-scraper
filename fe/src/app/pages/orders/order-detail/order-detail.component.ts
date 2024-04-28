import { Component, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbAccordionItemComponent } from '@nebular/theme';
import { Order } from '../../../@core/models/order/order.model';
import { OrderService } from '../../../@core/services/order/order.service';

@Component({
  selector: 'ngx-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {
  @ViewChildren(NbAccordionItemComponent) accordions: QueryList<NbAccordionItemComponent>;

  order: Order;
  constructor(
    private activatedRoute: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {
    this.activatedRoute.params.subscribe(
      params => {
        this.orderService.findById(+params['id']).subscribe(
          data => {
            this.order = data
          }
        )
      }
    )
  }
}
