import { CATALOG_IMAGE_DIRECTORY } from '../../../@core/utils/image-storing-directory';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs'
import { Component, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { Catalog } from "../../../@core/models/product/catalog.model";
import { CatalogService } from "../../../@core/services/product/product-catalog.service";
import { ToastState, UtilsService } from "../../../@core/services/utils.service";
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource, NbTreeGridDataSourceBuilder, NbWindowRef, NbWindowService } from '@nebular/theme';
import { CapitalizePipe } from '../../../@theme/pipes';


interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface FSEntry {
  catalogId: number;
  catalogName: string;
  image: string;
  description: string;
}


@Component({
  selector: "ngx-product-catalog",
  templateUrl: "./product-catalog.component.html",
  styleUrls: ["./product-catalog.component.scss"],
})
export class ProductCatalogComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  state: string = "add"; // default

  // for deleting multi catalog
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  selectedCatalogs: Catalog[] = []
  deleteWindowRef: NbWindowRef;
  loadedCatalogs: boolean = false;

  // for loading table
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 10; // default
  
  // table
  customColumn = 'Image';
  defaultColumns = [ 'catalogId', 'catalogName', 'description' ];
  actionColumn = 'Action'
  allColumns = [ this.customColumn, ...this.defaultColumns, this.actionColumn ];
  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  dataSource: NbTreeGridDataSource<FSEntry>;

  constructor(
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<FSEntry>,
    private catalogService: CatalogService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
  ) { 
  }

  ngOnInit() {
    this.catalogService.catalogChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadCatalogs();
      });
    this.loadCatalogs()

    this.catalogService.state$.subscribe((state) => {
      this.state = state;
    })
  }

  loadCatalogs() {
    this.catalogService.findAll().subscribe(
      data => {
        const mappedCatalogs: TreeNode<FSEntry>[] = this.mapTableValue(data);
        this.dataSource = this.dataSourceBuilder.create(mappedCatalogs);
        this.loadedCatalogs = true
      }
    )
  }

  updateSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  mapTableValue(catalogs: Catalog[]): TreeNode<FSEntry>[] {
    let treeNodes: TreeNode<FSEntry>[] = []
    for(let catalog of catalogs) {
      if(catalog.childCatalogs.length == 0) {
        treeNodes.push(this.mapSingleCatalogToNode(catalog))
      } else {
        let childrenTreeNodes: TreeNode<FSEntry>[] = []
        for(let subCatalog of catalog.childCatalogs) {
          childrenTreeNodes.push(this.mapSingleCatalogToNode(subCatalog))
        }
        treeNodes.push(this.mapSingleCatalogToNode(catalog, childrenTreeNodes, true))
      }
    }
    return treeNodes;
  }

  mapSingleCatalogToNode(catalog: Catalog, children?: TreeNode<FSEntry>[], expanded?: boolean): TreeNode<FSEntry> {
    return {
      data: {
        catalogId: catalog.catalogId,
        image: (catalog.image == null) ? "" : CATALOG_IMAGE_DIRECTORY + catalog.image.imageUrl,
        description: catalog.description.length <= 75 ? catalog.description : catalog.description.substring(0, 75) + '...',
        catalogName: catalog.catalogName
      },
      children: children != null ? children : null,
      expanded: expanded != null
    }
  }

  numberOfItemsChange() {
    localStorage.setItem('itemPerPage', this.numberOfItem.toString())
  }

  onRowSelect(event: any): void {
    this.selectedCatalogs = (event.selected) as Catalog[]
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Catalogs` });
  }

  onDeleteCatalogs() {
    this.catalogService.deleteCatalogs(this.selectedCatalogs).subscribe(
      data => {
        if (data) {
          this.selectedCatalogs = []
          this.deleteWindowRef.close()
          this.catalogService.notifyCatalogChange();
          this.utilsService.updateToastState(new ToastState('Delete The Catalogs Successfully!', "success"))
        } else {
          this.utilsService.updateToastState(new ToastState('Delete The Catalogs Failed!', "danger"))
        }
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Delete The Catalogs Failed!', "danger"))
        console.log(error);
      }
    )
  }
}

