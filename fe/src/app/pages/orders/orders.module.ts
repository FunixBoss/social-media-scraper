import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { RouterModule } from '@angular/router';
import { OrderListComponent } from './order-list/order-list.component';
import { OrdersRoutingModule } from './orders-routing.module';
import { NbAccordionModule, NbActionsModule, NbAutocompleteComponent, NbAutocompleteModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconComponent, NbIconModule, NbInputModule, NbRadioModule, NbSelectModule, NbSpinnerModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { OrderAddComponent } from './order-add/order-add.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomOrderActionComponent } from './order-list/custom/custom-order-action.component';
import { CustomOrderFilterActionsComponent } from './order-list/custom/custom-order-filter-actions.component';
import { CustomOrderStatusActionComponent } from './order-list/custom/custom-order-status-action.component';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    OrdersComponent,
    OrderDetailComponent,
    OrderListComponent,
    OrderAddComponent,
    CustomOrderActionComponent,
    CustomOrderFilterActionsComponent,
    CustomOrderStatusActionComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    OrdersRoutingModule,
    NbCardModule,
    Ng2SmartTableModule,
    Ng2CompleterModule,
    NbInputModule,
    NbButtonModule,
    NbActionsModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbAccordionModule,
    FormsModule,
    NbAutocompleteModule,
    ReactiveFormsModule,
    NbIconModule,
    ThemeModule,
    SharedModule,
    NbSpinnerModule
  ]
})
export class OrdersModule { }
