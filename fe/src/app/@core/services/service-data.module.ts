import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from './users.service';
import { OrdersChartService } from './orders-profit-chart/orders-chart.service';
import { ProfitChartService } from './orders-profit-chart/profit-chart.service';
import { PeriodsService } from './periods.service';
import { OrdersProfitChartService } from './orders-profit-chart/orders-profit-chart.service';
import { ProgressInfoService } from './progress-bar-chart/progress-info.service';

const SERVICES = [
  UserService,
  OrdersChartService,
  ProfitChartService,
  PeriodsService,
  OrdersProfitChartService,
  ProgressInfoService,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ...SERVICES,
  ],
})
export class ServiceDataModule {
  static forRoot(): ModuleWithProviders<ServiceDataModule> {
    return {
      ngModule: ServiceDataModule,
      providers: [
        ...SERVICES,
      ],
    };
  }
}
