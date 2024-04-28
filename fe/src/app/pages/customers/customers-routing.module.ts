import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CustomerListComponent } from "./customer-list/customer-list.component";
import { CustomersComponent } from "./customers.component";
import { CustomerDetailComponent } from "./customer-detail/customer-detail.component";
import { CustomerContactComponent } from "./customer-contact/customer-contact.component";

const routes: Routes = [
    {
        path: "",
        component: CustomersComponent,
        children: [
            {
                path: "list",
                component: CustomerListComponent,
            },
            {
                path: "contact",
                component: CustomerContactComponent,
            },
            {
                path: "detail/:id",
                component: CustomerDetailComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CustomersRoutingModule { }

export const routedComponents = [
    CustomersComponent,
    CustomerListComponent,
    CustomerDetailComponent,
];
