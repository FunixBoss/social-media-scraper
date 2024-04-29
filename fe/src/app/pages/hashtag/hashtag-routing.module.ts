import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HashtagComponent } from "./hashtag.component";
import { HashtagListComponent } from "./list/hashtag.component";
import { HashtagAddComponent } from "./list/hashtag-add/hashtag-add.component";

const routes: Routes = [
    {
        path: "",
        component: HashtagComponent,
        children: [
            {
                path: "list",
                component: HashtagListComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HashtagsRoutingModule { }

export const routedComponents = [
    HashtagAddComponent,
];
