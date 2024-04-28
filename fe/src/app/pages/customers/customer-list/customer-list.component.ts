import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DatePipe } from '@angular/common';
import { CustomCustomerActionComponent } from './custom/custom-customer-action/custom-customer-action.component';
import { CustomCustomerImageComponent } from './custom/custom-customer-image.component';
import { AccountService } from '../../../@core/services/account/account.service';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { CustomCustomerFilterActionsComponent } from './custom/custom-customer-filter-actions/custom-customer-filter-actions.component';
import { Subject } from 'rxjs';
import { ACCOUNT_IMAGE_DIRECTORY } from '../../../@core/utils/image-storing-directory';
import { CustomCustomerActiveActionComponent } from './custom/custom-customer-active-action.component';
import { Account } from '../../../@core/models/account/account.model';

@Component({
  selector: "ngx-customer-list",
  templateUrl: "./customer-list.component.html",
  styleUrls: ["./customer-list.component.scss"],
})
export class CustomerListComponent implements OnInit, AfterViewInit {
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 10; // default
  source: LocalDataSource = new LocalDataSource();
  private unsubscribe = new Subject<void>();

  selectedCustomers: Account[] = []
  loadedCustomers: boolean = false

  settings = {
    selectMode: 'multi',
    actions: {
      position: 'right',
      edit: false,
      delete: false,
      add: false,
      columnTitle: ''
    },
    columns: {
      imageUrl: {
        title: "Avatar",
        type: "custom",
        renderComponent: CustomCustomerImageComponent,
        sort: false,
        filter: false
      },
      id: {
        title: 'ID',
        type: 'number',
        width: '3%'
      },
      username: {
        title: 'Username',
        type: 'string',
      },
      email: {
        title: 'Email',
        type: 'string',
      },
      fullName: {
        title: 'Full Name',
        type: 'string'
      },
      phoneNumber: {
        title: 'Phone Number',
        type: 'string',
      },
      totalOrder: {
        title: 'Total Orders',
        type: 'number',
        width: '10%'
      },
      createdAt: {
        title: 'Registration Date',
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
        renderComponent: CustomCustomerActiveActionComponent
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomCustomerFilterActionsComponent,
        },
        renderComponent: CustomCustomerActionComponent
      }
    },
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  }

  constructor(
    private accountService: AccountService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.accountService.accountChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadCustomers();
      });
    this.loadCustomers();
  }

  loadCustomers() {
    this.accountService.findAll().subscribe(
      data => {
        const mappedAccounts: any[] = data.map(account => {
          return {
            id: account.id,
            username: account.username,
            imageUrl: account.image !== null ? ACCOUNT_IMAGE_DIRECTORY + account.image.imageUrl : 'assets/images/no-image.jpg',
            fullName: account.fullName,
            email: account.email,
            phoneNumber: account.phoneNumber,
            active: account.active,
            createdAt: new DatePipe('en-US').transform(account.createdAt, 'dd-MM-yyyy'),
            totalOrder: account.totalOrders != undefined ? account.totalOrders : 0
          }
        })
        this.source.load(mappedAccounts)
        this.loadedCustomers = true
      }
    )
  }

  ngAfterViewInit() {
    const pager = document.querySelector('ng2-smart-table-pager');
    pager.classList.add('d-block')
  }

  onRowSelect(event: any): void {
    this.selectedCustomers = (event.selected) as Account[]
  }

  onUpdateStatus(isUpdated: boolean) {
    if(isUpdated) {
      this.loadCustomers();
      this.selectedCustomers = []
      this.utilsService.updateToastState(new ToastState("Updated The Customers's Status Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Customers's Status Failed!", "danger"))
    }
  }
}
