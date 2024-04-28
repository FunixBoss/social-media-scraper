import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter } from "@angular/core";
import { ProductSale } from "../../../../@core/models/sale/product-sale.model";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { NbWindowRef, NbWindowService } from "@nebular/theme";
import { ProductSaleService } from "../../../../@core/services/product/product-sale.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Account } from "../../../../@core/models/account/account.model";
import { AccountService } from "../../../../@core/services/account/account.service";

@Component({
  selector: "ngx-customers-list-multi",
  templateUrl: "./customer-list-multi.component.html",
  styleUrls: ["./customer-list-multi.component.scss"],
})
export class CustomerListMultiComponent implements OnInit {

  @Input() selectedCustomers: Account[]
  @Output() isUpdated = new EventEmitter<boolean>();

  @ViewChild('onUpdateStatusTemplate') updateStatusWindow: TemplateRef<any>;
  updateStatusWindowRef: NbWindowRef;
  statusFormGroup: FormGroup

  constructor(    
    private accountService: AccountService,
    private windowService: NbWindowService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.statusFormGroup = this.formBuilder.group({
      active: [false]
    })
  }

  openEditWindow() {
    this.updateStatusWindowRef = this.windowService
      .open(this.updateStatusWindow, { title: `Update Customers's Active Status` });
  }

  onUpdateStatus() {
    if (this.statusFormGroup.invalid) {
      this.statusFormGroup.markAllAsTouched();
      return;
    }
    
    this.accountService.updateStatus(this.selectedCustomers, this.statusFormGroup.get('active').value).subscribe(
      () => {
        this.selectedCustomers = []
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