import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";

const routes: Routes = [
  {
    path: "", component: PagesComponent,
    children: [
      {
        path: "keywords",
        loadChildren: () => import("./keyword/keyword.module").then((m) => m.KeywordModule),
      },
      {
        path: "hashtags",
        loadChildren: () => import("./hashtag/hashtag.module").then((m) => m.HashtagModule),
      },
      {
        path: "channels",
        loadChildren: () => import("./channel/channel.module").then((m) => m.ChannelsModule),
      },
      { path: "", redirectTo: "", pathMatch: "full" },
      { path: "**", redirectTo: "" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
