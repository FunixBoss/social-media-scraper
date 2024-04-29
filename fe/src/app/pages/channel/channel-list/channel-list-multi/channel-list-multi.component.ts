import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from "@angular/core";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "ngx-channels-list-multi",
  templateUrl: "./channel-list-multi.component.html",
  styleUrls: ["./channel-list-multi.component.scss"],
})
export class ChannelListMultiComponent {

  @Input() selectedChannels: any[]
  @Output() isDeleted = new EventEmitter<boolean>();
  @Output() isUpdatedNewStatus = new EventEmitter<boolean>();
  @Output() isUpdatedTopStatus = new EventEmitter<boolean>();
  @Output() isUpdatedActiveStatus = new EventEmitter<boolean>();
  @Output() isUpdatedStatuses = new EventEmitter<boolean>();

  @Output() isAppliedSale = new EventEmitter<boolean>();

  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  deleteWindowRef: NbWindowRef;

  @ViewChild('onUpdateNewStatusTemplate') updateNewStatusWindow: TemplateRef<any>;
  updateNewStatusWindowRef: NbWindowRef;

  @ViewChild('onUpdateTopStatusTemplate') updateTopStatusWindow: TemplateRef<any>;
  updateTopStatusWindowRef: NbWindowRef;

  @ViewChild('onUpdateActiveStatusTemplate') updateActiveStatusWindow: TemplateRef<any>;
  updateActiveStatusWindowRef: NbWindowRef;

  @ViewChild('onAppliedSaleTemplate') appliedSaleWindow: TemplateRef<any>;
  appliedSaleWindowRef: NbWindowRef;

  @ViewChild('updateStatusesTemplate') updateStatusesWindow: TemplateRef<any>;
  updateStatusesWindowRef: NbWindowRef;


  newFormGroup: FormGroup
  topFormGroup: FormGroup
  activeFormGroup: FormGroup
  saleFormGroup: FormGroup
  statusesFormGroup: FormGroup
  constructor(
    private windowService: NbWindowService,
    private formBuilder: FormBuilder
  ) {
    this.newFormGroup = formBuilder.group({
      new_: [, Validators.required]
    })
    this.topFormGroup = formBuilder.group({
      top: [, Validators.required]
    })
    this.activeFormGroup = formBuilder.group({
      active: [, Validators.required]
    })
    this.saleFormGroup = formBuilder.group({
      productSale: [null],
    })
    this.statusesFormGroup = formBuilder.group({
      new_: [false],
      top: [false],
      active: [false],
      productSale: [null],
    })
    // this.saleService.findAll().subscribe(data => {
    //   this.productSales = data._embedded.productSales.filter(sale => sale.active != false)
    // })
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Products` });
  }
  onDelete() {
    // this.productService.deleteProducts(this.selectedProducts).subscribe(
    //   () => {
    //     this.selectedProducts = []
    //     this.deleteWindowRef.close()
    //     this.isDeleted.emit(true);
    //   },
    //   error => {
    //     console.log(error);
    //     this.isDeleted.emit(false);
    //   }
    // )
  }



  openNewStatusWindow() {
    this.updateNewStatusWindowRef = this.windowService
      .open(this.updateNewStatusWindow, { title: `Update Status New` });
  }
  onUpdateNewStatus() {
    // this.productService.updateStatusNew(this.selectedProducts, this.newFormGroup.get('new_').value)
    //   .subscribe(
    //     () => {
    //       this.selectedProducts = []
    //       this.newFormGroup.reset()
    //       this.updateNewStatusWindowRef.close()
    //       this.isUpdatedNewStatus.emit(true);
    //     },
    //     error => {
    //       console.log(error);
    //       this.isUpdatedNewStatus.emit(false);
    //     }
    //   )
  }



  openTopStatusWindow() {
    this.updateTopStatusWindowRef = this.windowService
      .open(this.updateTopStatusWindow, { title: `Update Status Top` });
  }
  onUpdateTopStatus() {
    // this.productService.updateStatusTop(this.selectedProducts, this.topFormGroup.get('top').value)
    //   .subscribe(
    //     () => {
    //       this.selectedProducts = []
    //       this.topFormGroup.reset()
    //       this.updateTopStatusWindowRef.close()
    //       this.isUpdatedTopStatus.emit(true);
    //     },
    //     error => {
    //       console.log(error);
    //       this.isUpdatedTopStatus.emit(false);
    //     }
    //   )
  }




  openActiveStatusWindow() {
    this.updateActiveStatusWindowRef = this.windowService
      .open(this.updateActiveStatusWindow, { title: `Update Status Active` });
  }
  onUpdateActiveStatus() {
    // this.productService.updateStatusActive(this.selectedProducts, this.activeFormGroup.get('active').value)
    //   .subscribe(
    //     () => {
    //       this.selectedProducts = []
    //       this.updateActiveStatusWindowRef.close()
    //       this.isUpdatedActiveStatus.emit(true);
    //     },
    //     error => {
    //       console.log(error);
    //       this.isUpdatedActiveStatus.emit(false);
    //     }
    //   )
  }




  openSaleStatusWindow() {
    this.appliedSaleWindowRef = this.windowService
      .open(this.appliedSaleWindow, { title: `Update Product Sale` });
  }
  onAppliedSale() {
    // this.productService.appliedProductSale(this.selectedProducts, this.saleFormGroup.get('productSale').value)
    //   .subscribe(
    //     (data) => {
    //       if (data) {
    //         this.selectedProducts = []
    //         this.appliedSaleWindowRef.close()
    //         this.isAppliedSale.emit(true);
    //       }
    //     },
    //     error => {
    //       console.log(error);
    //       this.isAppliedSale.emit(false);
    //     }
    //   )
  }



  openUpdateStatusesWindow() {
    this.updateStatusesWindowRef = this.windowService
      .open(this.updateStatusesWindow, { title: `Update Product Status` });
  }
  onUpdateStatuses() {
    // this.productService.updateStatuses(this.selectedProducts,
    //   this.statusesFormGroup.get('new_').value,
    //   this.statusesFormGroup.get('top').value,
    //   this.statusesFormGroup.get('active').value,
    //   this.statusesFormGroup.get('productSale').value)
    //   .subscribe(
    //     (data) => {
    //       if (data) {
    //         this.selectedProducts = []
    //         this.updateStatusesWindowRef.close()
    //         this.isUpdatedStatuses.emit(true);
    //       }
    //     },
    //     error => {
    //       console.log(error);
    //       this.isUpdatedStatuses.emit(false);
    //     }
    //   )
  }

}