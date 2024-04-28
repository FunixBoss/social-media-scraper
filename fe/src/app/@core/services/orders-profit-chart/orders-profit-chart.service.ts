import { of as observableOf,  Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators'
import { Injectable } from '@angular/core';
import { OrdersChart } from '../../models/chart/orders-chart';
import { OrderProfitChart } from '../../models/chart/orders-profit-chart';
import { OrdersChartService } from './orders-chart.service';
import { ProfitChartService } from './profit-chart.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class OrdersProfitChartService {

  constructor(
    private ordersChartService: OrdersChartService,         
    private orderService: OrderService
  ) {}

  getOrderProfitChart(): Observable<OrderProfitChart[]> {
    const all$ = this.orderService.count();
    const month$ = this.orderService.countOrdersLastMonth();
    const week$ = this.orderService.countOrdersThisWeek();
    const today$ = this.orderService.countOrdersToday();

    return forkJoin([all$, month$, week$, today$]).pipe(
      map(([all, month, week, today]) => {
        return [
          {
            title: 'Marketplace',
            value: all,
          },
          {
            title: 'Last Month',
            value: month,
          },
          {
            title: 'This Week',
            value: week,
          },
          {
            title: 'Today',
            value: today,
          },
        ];
      })
    );
  }

  getOrdersChartData(period: string): Observable<OrdersChart> {
    return observableOf(this.ordersChartService.getOrdersChartData(period));
  }

}
