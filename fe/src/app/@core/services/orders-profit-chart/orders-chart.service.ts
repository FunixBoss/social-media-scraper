import { Injectable } from '@angular/core';
import { PeriodsService } from '../periods.service';
import { OrdersChart } from '../../models/chart/orders-chart';

@Injectable()
export class OrdersChartService {

  private data = { };

  constructor(private period: PeriodsService) {
    this.data = {
      week: this.getDataForWeekPeriod(),
      month: this.getDataForMonthPeriod(),
    };
  }

  private getDataForWeekPeriod(): OrdersChart {
    return {
      chartLabel: this.getDataLabels(42, this.period.getWeeks()),
      linesData: [
        [
          18, 26, 32, 36, 38, 39,
          39, 37, 34, 30, 26, 22,
          19, 15, 13, 10, 33, 33, 33,
          10, 12, 14, 16, 18, 21,
          23, 25, 28, 30, 31, 32,
          33, 34, 33, 32, 31, 28,
          25, 22, 17, 12, 71,
        ],
        [
          15, 17, 19, 20, 21, 21,
          20, 19, 18, 17, 16, 16,
          16, 16, 15, 15, 15, 16,
          17, 19, 21, 23, 25, 27,
          29, 30, 30, 30, 30, 29,
          28, 27, 26, 25, 24, 23,
          23, 23, 23, 23, 23, 23,
        ],
        [
          30, 33, 36, 39, 42, 45,
          42, 39, 36, 38, 40, 42,
          45, 50, 47, 46, 45, 44, 40,
          50, 60, 70, 50, 47, 40, 30,
          33, 36, 37, 39, 40, 42,
          40, 42, 33, 40, 40, 40,
          29, 29, 29, 29, 29,
        ],
      ],
    };
  }

  private getDataForMonthPeriod(): OrdersChart {
    return {
      chartLabel: this.getDataLabels(47, this.period.getMonths()),
      linesData: [
        [
          5, 63, 113, 156, 194, 225,
          250, 270, 283, 289, 290,
          286, 277, 264, 244, 220,
          194, 171, 157, 151, 150,
          152, 155, 160, 166, 170,
          167, 153, 135, 115, 97,
          82, 71, 64, 63, 62, 61,
          62, 65, 73, 84, 102,
          127, 159, 203, 259, 333,
        ],
        [
          6, 83, 148, 200, 240,
          265, 273, 259, 211,
          122, 55, 30, 28, 36,
          50, 68, 88, 109, 129,
          146, 158, 163, 165,
          173, 187, 208, 236,
          271, 310, 346, 375,
          393, 400, 398, 387,
          368, 341, 309, 275,
          243, 220, 206, 202,
          207, 222, 247, 286, 348,
        ],
        [
          398, 348, 315, 292, 274,
          261, 251, 243, 237, 231,
          222, 209, 192, 172, 152,
          132, 116, 102, 90, 80, 71,
          64, 58, 53, 49, 48, 54, 66,
          84, 104, 125, 142, 156, 166,
          172, 174, 172, 167, 159, 149,
          136, 121, 105, 86, 67, 45, 22,
        ],
      ],
    };
  }

  getDataLabels(nPoints: number, labelsArray: string[]): string[] {
    const labelsArrayLength = labelsArray.length;
    const step = Math.round(nPoints / labelsArrayLength);

    return Array.from(Array(nPoints)).map((item, index) => {
      const dataIndex = Math.round(index / step);

      return index % step === 0 ? labelsArray[dataIndex] : '';
    });
  }

  getOrdersChartData(period: string): OrdersChart {
    return this.data[period];
  }
}
