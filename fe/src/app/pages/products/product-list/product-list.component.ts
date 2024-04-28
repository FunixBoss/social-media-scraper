import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CustomProductActionComponent } from './custom/custom-product-action.component';
import { CustomProductFilterActionsComponent } from './custom/custom-product-filter-actions.component';
import { ProductService } from '../../../@core/services/product/product.service';
import { CatalogService } from '../../../@core/services/product/product-catalog.service';
import { forkJoin, Subject } from 'rxjs';
import { PRODUCT_IMAGE_DIRECTORY } from '../../../@core/utils/image-storing-directory';
import { ProductSale } from '../../../@core/models/sale/product-sale.model';
import { ProductSaleService } from '../../../@core/services/product/product-sale.service';
import { CustomProductStatusComponent } from './custom/custom-product-status.component';
import { CustomProductStatusFilterComponent } from './custom/custom-product-status-filter.component';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { Catalog } from '../../../@core/models/product/catalog.model';
import { CustomCatalogImageComponent } from '../product-catalog/custom/custom-catalog-image.component';
import { PlantingDifficultyLevel } from '../../../@core/models/product/planting-difficulty-level.model';
import { PlantingDifficultyLevelService } from '../../../@core/services/product/planting-difficulty-level.service';

@Component({
  selector: 'ngx-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, AfterViewInit {
  private unsubscribe = new Subject<void>();
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 5;
  source: LocalDataSource = new LocalDataSource();

  loadedList: boolean = false;
  // Setting for List layout
  catalogs: Catalog[];
  sales: ProductSale[];
  levels: PlantingDifficultyLevel[]

  // for select multi
  selectedProducts: any[] = []
  settings = {
    selectMode: 'multi',
    actions: {
      position: 'right',
      edit: false,
      delete: false,
      add: false,
      columnTitle: ''
    },
    columns: {},
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  };


  constructor(
    private productService: ProductService,
    private catalogService: CatalogService,
    private saleService: ProductSaleService,
    private utilsService: UtilsService,
    private levelService: PlantingDifficultyLevelService
  ) {

  }

  ngOnInit(): void {
    const catalog$ = this.catalogService.findAll();
    const sale$ = this.saleService.findAll();
    const level$ = this.levelService.findAll();

    forkJoin([catalog$, sale$, level$]).subscribe(
      ([catalogData, saleData, levelData]) => {
        this.catalogs = catalogData;
        this.sales = saleData._embedded.productSales;
        this.levels = levelData._embedded.plantingDifficultyLevels

        this.settings = {
          selectMode: 'multi',
          actions: {
            position: 'right',
            edit: false,
            delete: false,
            add: false,
            columnTitle: ''
          },
          columns: {
            image: {
              title: 'Image',
              type: 'custom',
              sort: false,
              filter: false,
              renderComponent: CustomCatalogImageComponent
            },
            productId: {
              title: 'ID',
              type: 'number',
              width: '3%'
            },
            productName: {
              title: 'Name',
              type: 'string',
            },
            difficulty: {
              title: 'Difficulty',
              type: 'string',
              width: "8%",
              filter: {
                type: 'list',
                config: {
                  selectText: 'Difficulty...',
                  list: this.levels.map(level => {
                    return { value: level.level, title: level.level }
                  }),
                },
              },
            },
            catalog: {
              title: 'Catalog',
              type: 'string',
              width: "8%",
              filter: {
                type: 'list',
                config: {
                  selectText: 'Catalog...',
                  list: this.catalogs.map(cata => {
                    return { value: cata.catalogName, title: cata.catalogName }
                  }),
                },
              },
            },
            sale: {
              title: 'Sale',
              type: 'string',
              width: "8%",
              filter: {
                type: 'list',
                config: {
                  selectText: 'Sale...',
                  list: this.sales.map(sale => {
                    return { value: sale.saleName, title: sale.saleName }
                  })
                },
              },
            },
            totalSold: {
              title: 'Sold',
              type: 'number',
              width: '5%'
            },
            totalLikes: {
              title: 'Likes',
              type: 'number',
              width: '5%'
            },
            totalRating: {
              title: 'Rating',
              type: 'number',
              width: '5%'
            },
            status: {
              title: 'Status',
              type: 'custom',
              sort: false,
              width: "7%",
              filter: {
                type: 'custom',
                component: CustomProductStatusFilterComponent,
              },
              renderComponent: CustomProductStatusComponent,
              filterFunction: (value, query) => {
                value = JSON.parse(value)
                query = JSON.parse(query)
                const result: boolean = query.every((status) => value[status] === true);
                value = JSON.stringify(value);
                query = JSON.stringify(query);

                return result
              }
            },
            actions: {
              title: 'Actions',
              type: 'custom',
              sort: false,
              filter: {
                type: 'custom',
                component: CustomProductFilterActionsComponent,
              },
              renderComponent: CustomProductActionComponent
            }
          },
          pager: {
            display: true,
            perPage: this.numberOfItem
          },
        };

        this.productService.productChange$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.loadProducts();
          });
        this.loadProducts();
        this.loadedList = true
      },
      (error: any) => {
        console.error("Error:", error);
      }
    );
  }

  loadProducts() {
    this.productService.findAll().subscribe(
      data => {
        const mappedProducts: any[] = data.reverse().map(pro => {
          return {
            productId: pro.productId,
            productName: pro.productName,
            catalog: pro.catalog != null ? pro.catalog.catalogName : null,
            sale: pro.productSale != null ? pro.productSale.saleName : null,
            difficulty: pro.plantingDifficultyLevel != null ? pro.plantingDifficultyLevel.level : null,
            image: PRODUCT_IMAGE_DIRECTORY + pro.imageUrl,
            status: JSON.stringify({
              new: pro.new_,
              top: pro.top,
              active: pro.active,
              sale: pro.sale,
            }),
            totalSold: pro.totalSold,
            totalLikes: pro.totalLikes,
            totalRating: pro.totalRating,
          }
        })
        this.source.load(mappedProducts)
      })
  }

  ngAfterViewInit() {
    const pager = document.querySelector('ng2-smart-table-pager');
    if (pager != null) {
      pager.classList.add('d-block')
    }
  }

  onRowSelect(event: any): void {
    this.selectedProducts = (event.selected)

  }

  onDelete(isDeleted: boolean) {
    if (isDeleted) {
      this.loadProducts();
      this.selectedProducts = []
      this.utilsService.updateToastState(new ToastState('Delete The Product\'s Status Successfully!', "success"))
    } else {
      this.utilsService.updateToastState(new ToastState('Delete The Product\'s Status Failed!', "danger"))
    }
  }

  onUpdateNewStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedProducts = []
      this.loadProducts();
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status New Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status New Failed!", "danger"))
    }
  }

  onUpdateTopStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedProducts = []
      this.loadProducts();
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status Top Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status Top Failed!", "danger"))
    }
  }

  onUpdateActiveStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedProducts = []
      this.loadProducts();
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status Active Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Product's Status Active Failed!", "danger"))
    }
  }

  onAppliedSale(isAppliedSale: boolean) {
    if (isAppliedSale) {
      this.selectedProducts = []
      this.loadProducts();
      this.utilsService.updateToastState(new ToastState("Updated The Product's Sale Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Product's Sale Failed!", "danger"))
    }
  }

  onUpdateStatuses(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedProducts = []
      this.loadProducts();
      this.utilsService.updateToastState(new ToastState("Updated Statuses Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated Statuses Failed!", "danger"))
    }
  }
}
