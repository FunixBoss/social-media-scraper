import { CustomerDetailCommentsComponent } from './customer-detail/customer-detail-comments/customer-detail-comments.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersComponent } from './customers.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { CustomersRoutingModule } from './customers-routing.module';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbActionsModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTabsetModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CustomCustomerActionComponent } from './customer-list/custom/custom-customer-action/custom-customer-action.component';
import { CustomCustomerImageComponent } from './customer-list/custom/custom-customer-image.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomCustomerFilterActionsComponent } from './customer-list/custom/custom-customer-filter-actions/custom-customer-filter-actions.component';
import { CustomCustomerActiveActionComponent } from './customer-list/custom/custom-customer-active-action.component';
import { CustomerListMultiComponent } from './customer-list/customer-list-multi/customer-list-multi.component';
import { CustomerDetailBasicComponent } from './customer-detail/customer-detail-basic/customer-detail-basic.component';
import { CustomerDetailOrdersComponent } from './customer-detail/customer-detail-orders/customer-detail-orders.component';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { CustomCustomerContactActionComponent } from './customer-contact/custom-customer-contact-action.component';
import { CustomerContactComponent } from './customer-contact/customer-contact.component';



@NgModule({
  declarations: [
    CustomersComponent,
    CustomerListComponent,
    CustomerDetailComponent,
    CustomerContactComponent,
    CustomCustomerActionComponent,
    CustomCustomerImageComponent,
    CustomCustomerFilterActionsComponent,
    CustomCustomerActiveActionComponent,
    CustomerListMultiComponent,
    CustomCustomerContactActionComponent,
    CustomerDetailBasicComponent,
    CustomerDetailCommentsComponent,
    CustomerDetailOrdersComponent
  ],
  imports: [
    CustomersRoutingModule,
    RouterModule,
    CommonModule,
    NbCardModule,
    Ng2SmartTableModule,
    NbInputModule,
    NbButtonModule,
    NbActionsModule,    
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbAccordionModule,
    NbIconModule,
    FormsModule,
    ReactiveFormsModule,
    NbTabsetModule,
    NbFormFieldModule,
    NgbRatingModule,
    SharedModule,
    NbSpinnerModule
  ]
})
export class CustomersModule { }
