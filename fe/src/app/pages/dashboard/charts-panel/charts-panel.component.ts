import { Component, OnDestroy, ViewChild } from '@angular/core';
import { takeWhile } from 'rxjs/operators';

import { OrdersChartComponent } from './charts/orders-chart.component';
import { OrdersChart } from '../../../@core/models/chart/orders-chart';
import { ProfitChart } from '../../../@core/models/chart/profit-chart';
import { OrderProfitChart } from '../../../@core/models/chart/orders-profit-chart';
import { OrdersProfitChartService } from '../../../@core/services/orders-profit-chart/orders-profit-chart.service';

@Component({
  selector: 'ngx-ecommerce-charts',
  styleUrls: ['./charts-panel.component.scss'],
  templateUrl: './charts-panel.component.html',
})
export class ECommerceChartsPanelComponent implements OnDestroy {

  private alive = true;

  chartPanelSummary: OrderProfitChart[];
  period: string = 'week';
  ordersChartData: OrdersChart;

  @ViewChild('ordersChart', { static: true }) ordersChart: OrdersChartComponent;

  constructor(private ordersProfitChartService: OrdersProfitChartService) {
    this.ordersProfitChartService.getOrderProfitChart()
      .pipe(takeWhile(() => this.alive))
      .subscribe((summary) => {
        this.chartPanelSummary = summary;
      });

    this.getOrdersChartData(this.period);
  }

  setPeriodAndGetChartData(value: string): void {
    if (this.period !== value) {
      this.period = value;
    }

    this.getOrdersChartData(value);
  }

  getOrdersChartData(period: string) {
    this.ordersProfitChartService.getOrdersChartData(period)
      .pipe(takeWhile(() => this.alive))
      .subscribe(ordersChartData => {
        this.ordersChartData = ordersChartData;
      });
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
