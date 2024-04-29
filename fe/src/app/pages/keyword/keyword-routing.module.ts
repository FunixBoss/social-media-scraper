import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { KeywordComponent } from "./keyword.component";
import { KeywordListComponent } from "./list/keyword.component";
import { KeywordAddComponent } from "./list/keyword-add/keyword-add.component";

const routes: Routes = [
    {
        path: "",
        component: KeywordComponent,
        children: [
            {
                path: "list",
                component: KeywordListComponent,
            },
            {
                path: "add",
                component: KeywordAddComponent
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
    KeywordAddComponent,
    KeywordListComponent,
];
