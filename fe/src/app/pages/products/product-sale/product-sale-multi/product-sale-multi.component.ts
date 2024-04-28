import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from "@angular/core";
import { ProductSale } from "../../../../@core/models/sale/product-sale.model";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ProductSaleService } from "../../../../@core/services/product/product-sale.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "ngx-products-sale-multi",
  templateUrl: "./product-sale-multi.component.html",
  styleUrls: ["./product-sale-multi.component.scss"],
})
export class ProductSaleMultiComponent implements OnInit {

  @Input() selectedSales: ProductSale[]
  @Output() isDeleted = new EventEmitter<boolean>();
  @Output() isUpdated = new EventEmitter<boolean>();
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  deleteWindowRef: NbWindowRef;

  @ViewChild('onUpdateStatusTemplate') updateStatusWindow: TemplateRef<any>;
  updateStatusWindowRef: NbWindowRef;
  statusFormGroup: FormGroup

  constructor(    
    private saleService: ProductSaleService,
    private windowService: NbWindowService,
    private formBuilder: FormBuilder
  ) {
    this.statusFormGroup = formBuilder.group({
      active: [, Validators.required]
    })
  }

  ngOnInit(): void {
    1
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Sales` });
  }

  openEditWindow() {
    this.updateStatusWindowRef = this.windowService
      .open(this.updateStatusWindow, { title: `Update Sales's Status` });
  }

  onDelete() {
    this.saleService.deleteProductSales(this.selectedSales).subscribe(
      () => {
        this.selectedSales = []
        this.deleteWindowRef.close()
        this.isDeleted.emit(true);
      },
      error => {
        console.log(error);
        this.isDeleted.emit(false);
      }
    )
  }

  onUpdateStatus() {
    if (this.statusFormGroup.invalid) {
      this.statusFormGroup.markAllAsTouched();
      return;
    }
    
    this.saleService.updateStatus(this.selectedSales, this.statusFormGroup.get('active').value).subscribe(
      () => {
        this.selectedSales = []
        this.updateStatusWindowRef.close()
        this.isUpdated.emit(true);
      },
      error => {
        console.log(error);
        this.isUpdated.emit(false);
      }
    )
  }

}