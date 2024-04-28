import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { CustomOrderActionComponent } from './custom/custom-order-action.component';
import { CustomOrderFilterActionsComponent } from './custom/custom-order-filter-actions.component';
import { PaymentMethod } from '../../../@core/models/order/payment-method.model';
import { OrderStatus } from '../../../@core/models/order/order-status.model';
import { PaymentMethodService } from '../../../@core/services/order/payment-method.service';
import { OrderStatusService } from '../../../@core/services/order/order-status.service';
import { OrderService } from '../../../@core/services/order/order.service';
import { DatePipe } from '@angular/common';
import { Order } from '../../../@core/models/order/order.model';
import { CustomOrderStatusActionComponent } from './custom/custom-order-status-action.component';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';

@Component({
  selector: "ngx-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.scss"],
})
export class OrderListComponent implements OnInit, AfterViewInit {
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 10; // default
  source: LocalDataSource = new LocalDataSource();
  // Setting for List layout
  paymentMethods: PaymentMethod[];
  orderStatuses: OrderStatus[];
  private unsubscribe = new Subject<void>();

  // select multi order
  selectedOrders: Order[] = []
  loadedOrders: boolean = false;
  @ViewChild('editOrderStatus') editOrderStatusWindow: TemplateRef<any>;
  windowRef: NbWindowRef;
  editStatusFormGroup: FormGroup;



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
    private router: Router,
    private paymentMethodService: PaymentMethodService,
    private orderStatusService: OrderStatusService,
    private orderService: OrderService,
    private windowService: NbWindowService,
    private utilsService: UtilsService,
    private formBuilder: FormBuilder
  ) {

  }

  ngOnInit(): void {
    const paymentObservable = this.paymentMethodService.findAll();
    const orderStatusObservable = this.orderStatusService.findAll();

    forkJoin([paymentObservable, orderStatusObservable]).subscribe(
      ([paymentData, orderStatusDate]) => {
        this.paymentMethods = paymentData._embedded.paymentMethods;
        this.orderStatuses = orderStatusDate._embedded.orderStatuses;

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
            orderId: {
              title: 'ID',
              type: 'number',
              width: '3%'
            },
            orderTrackingNumber: {
              title: 'Tracking Number',
              type: 'string',
            },
            customerEmail: {
              title: 'Customer Email',
              type: 'string',
            },
            totalPrice: {
              title: 'Total Price',
              type: 'string',
            },
            totalQuantity: {
              title: 'Total Quantity',
              type: 'string',
            },
            paymentMethod: {
              title: 'Payment Method',
              type: 'string',
              filter: {
                type: 'list',
                config: {
                  selectText: 'Method...',
                  list: this.paymentMethods.map(pm => {
                    return { value: pm.methodName, title: pm.methodName }
                  }),
                },
              },
            },
            createdAt: {
              title: 'Created Date',
              type: 'string',
            },
            orderStatus: {
              title: 'Order Status',
              type: 'custom',
              renderComponent: CustomOrderStatusActionComponent,
              filter: {
                type: 'list',
                config: {
                  selectText: 'Status...',
                  list: this.orderStatuses.map(status => {
                    return { value: status.statusName, title: status.statusName }
                  })
                },
              },
            },
            actions: {
              title: 'Actions',
              type: 'custom',
              sort: false,
              filter: {
                type: 'custom',
                component: CustomOrderFilterActionsComponent,
              },
              renderComponent: CustomOrderActionComponent
            }
          },
          pager: {
            display: true,
            perPage: this.numberOfItem
          },
        }

        this.orderService.orderChange$
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.loadOrders();
          });
        this.loadOrders()
      }
    )



  }

  loadOrders() {
    this.orderService.findAll().subscribe(
      data => {
        const mappedOrders: any[] = data.map((order: Order) => {
          return {
            orderId: order.orderId,
            orderTrackingNumber: order.orderTrackingNumber,
            customerEmail: order.accountEmail,
            totalPrice: order.totalPrice + '$',
            totalQuantity: order.totalQuantity,
            paymentMethod: order.paymentMethod.methodName,
            orderStatus: order.orderStatus.statusName,
            createdAt: new DatePipe('en-US').transform(order.createdAt, 'dd/MM/yyyy').toString()
          }
        })
        this.source.load(mappedOrders)
        this.loadedOrders = true
      }
    )
  }

  onRowSelect(event: any): void {
    this.selectedOrders = (event.selected) as Order[]
  }

  ngAfterViewInit() {
    const pager = document.querySelector('ng2-smart-table-pager');
    pager.classList.add('d-block')
  }

  onEdit() {
    this.editStatusFormGroup = this.formBuilder.group({
      orderStatus: [null, Validators.required],
    })
    this.windowRef = this.windowService.open(
      this.editOrderStatusWindow, { title: 'Edit Order Status' },
    );
  }

  editStatus() {
    if (this.editStatusFormGroup.invalid) {
      this.editStatusFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Edit Order Status Failed!', 'danger'))
      return;
    }
    this.orderService.updateOrdersStatus(this.selectedOrders, this.editStatusFormGroup.get('orderStatus').value)
      .subscribe(
        data => {
          if (data) {
            this.selectedOrders = []
            this.loadOrders();
            this.utilsService.updateToastState(new ToastState('Edit Order Status Successfully!', 'success'))
            this.windowRef.close();
          }
        },
        error => {
          console.log(error);
          this.utilsService.updateToastState(new ToastState('Edit Order Status Failed!', 'danger'))

        }
      )
  }
}
