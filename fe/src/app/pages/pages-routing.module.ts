import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AuthenticationGuard } from "../@core/guard/authentication.guard";
import { ChangeProfileComponent } from "./dashboard/change-profile/change-profile.component";

const routes: Routes = [
  {
    path: "", component: PagesComponent, 
    //  canActivate: [AuthenticationGuard]
    children: [
      { path: "dashboard", component: DashboardComponent },
      { path: "change-profile", component: ChangeProfileComponent },
      {
        path: "keywords",
        loadChildren: () =>
          import("./keyword/keyword.module").then((m) => m.KeywordModule),
      },
      {
        path: "hashtags",
        loadChildren: () =>
          import("./hashtag/hashtag.module").then((m) => m.HashtagModule),
      },
      {
        path: "channels",
        loadChildren: () =>
          import("./channel/channel.module").then((m) => m.ChannelsModule),
      },
      {
        path: "products",
        loadChildren: () =>
          import("./products/products.module").then((m) => m.ProductsModule),
      },
      {
        path: "customers",
        loadChildren: () =>
          import("./customers/customers.module").then((m) => m.CustomersModule),
      },
      {
        path: "orders",
        loadChildren: () =>
          import("./orders/orders.module").then((m) => m.OrdersModule),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import("./auth/auth.module").then((m) => m.AuthModule),
      },
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "**",
        redirectTo: "dashboard",
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
