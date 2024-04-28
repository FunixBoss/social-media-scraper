import { NgModule } from "@angular/core";
import { NbSelectModule } from "@nebular/theme";
import { ItemOfListComponent } from "./item-of-list/item-of-list.component";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
        NbSelectModule,
        FormsModule
    ],
    declarations: [
        ItemOfListComponent
    ],
    exports: [
        ItemOfListComponent
    ]
  })
  export class SharedModule { }