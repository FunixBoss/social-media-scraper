import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { KeywordComponent } from "./keyword.component";
import { KeywordListComponent } from "./list/keyword.component";
import { KeywordAddComponent } from "./list/keyword-add/keyword-add.component";
import { HashtagListComponent } from "../hashtag/list/hashtag.component";

const routes: Routes = [
    {
        path: "",
        component: KeywordComponent,
        children: [
            {
                path: "list",
                component: KeywordListComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class KeywordsRoutingModule { }

export const routedComponents = [
    KeywordListComponent,
    HashtagListComponent
];
