import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CustomSaleFilterActionsComponent } from './custom/custom-sale-filter-actions.component';
import { ProductSale } from "../../../@core/models/sale/product-sale.model";
import { ProductSaleService } from "../../../@core/services/product/product-sale.service";
import { CustomSaleActionComponent } from "./custom/custom-sale-action.component";
import { CustomSaleActiveActionComponent } from "./custom/custom-sale-active-action.component";

@Component({
  selector: "ngx-products-sale",
  templateUrl: "./product-sale.component.html",
  styleUrls: ["./product-sale.component.scss"],
})
export class ProductSaleComponent implements OnInit {
  state: string = "add"; // default
  private unsubscribe = new Subject<void>();
  loadedSales: boolean = false;
  selectedSales: ProductSale[] = []

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
      productSaleId: {
        title: "ID",
        type: "number",
        width: '3%'
      },
      saleName: {
        title: "Name",
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
      active: {
        title: 'Status',
        sort: false,
        width: "10%",
        filter: {
          type: 'list',
          config: {
            selectText: 'Status...',
            list: [ 
              { value: 'true', title: 'Active' },
              { value: 'false', title: 'Inactive' },
            ]
          },
        },
        type: 'custom',
        renderComponent: CustomSaleActiveActionComponent
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomSaleFilterActionsComponent
        },
        renderComponent: CustomSaleActionComponent
      }
    },
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private saleService: ProductSaleService,
    private utilsService: UtilsService
  ) {
    this.saleService.saleChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadSales();
      });
    this.loadSales()
  }

  loadSales() {
    this.saleService.findAll().subscribe(
      data => {
        const mappedSalesupons = data._embedded.productSales.map((sale) => {
          return {
            productSaleId: sale.productSaleId,
            saleName: sale.saleName,
            description: sale.description,
            active: sale.active,
            discount: sale.productSaleType.productSaleTypeId == 1 ? '$' + sale.discount : sale.discount + '%',
            startedAt: new DatePipe('en-US').transform(sale.startedAt, 'dd/MM/yyyy').toString(),
            expiredAt: new DatePipe('en-US').transform(sale.expiredAt, 'dd/MM/yyyy').toString()
          }
        })
        this.source.load(mappedSalesupons)
        this.loadedSales = true
      }
    )
  }

  ngOnInit() {
    this.saleService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  onRowSelect(event: any): void {
    this.selectedSales = (event.selected) as ProductSale[]
  }

  onDelete(isDeleted: boolean) {
    if(isDeleted) {
      this.loadSales();
      this.selectedSales = []
      this.utilsService.updateToastState(new ToastState('Delete The Sales Successfully!', "success"))
    } else {
      this.utilsService.updateToastState(new ToastState('Delete The Sales Failed!', "danger"))
    }
  }

  onUpdateStatus(isUpdated: boolean) {
    if(isUpdated) {
      this.loadSales();
      this.selectedSales = []
      this.utilsService.updateToastState(new ToastState("Updated The Product Sales's Status Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Product Sales's Status Failed!", "danger"))
    }
  }


}
