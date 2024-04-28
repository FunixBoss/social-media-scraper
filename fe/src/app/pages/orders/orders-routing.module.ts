import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { OrderListComponent } from "./order-list/order-list.component";
import { OrdersComponent } from "./orders.component";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { OrderAddComponent } from "./order-add/order-add.component";

const routes: Routes = [
    {
        path: "",
        component: OrdersComponent,
        children: [
            {
                path: "list",
                component: OrderListComponent,
            },
            {
                path: "add",
                component: OrderAddComponent
            },
            {
                path: "detail/:id",
                component: OrderDetailComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdersRoutingModule { }

export const routedComponents = [
    OrdersComponent,
    OrderListComponent,
    OrderDetailComponent,
];
