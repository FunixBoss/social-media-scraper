import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbActionsModule, NbAutocompleteModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconComponent, NbIconModule, NbInputModule, NbRadioModule, NbSelectModule, NbSpinnerModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { Ng2CompleterModule } from 'ng2-completer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../shared/shared.module';
import { KeywordComponent } from './keyword.component';
import { KeywordListComponent } from './list/keyword.component';
import { KeywordAddComponent } from './list/keyword-add/keyword-add.component';
import { CustomKeywordActionComponent } from './list/custom/custom-keyword-action.component';
import { CustomKeywordFilterActionsComponent } from './list/custom/custom-keyword-filter-actions.component';
import { KeywordsRoutingModule } from './keyword-routing.module';



@NgModule({
  declarations: [
    KeywordComponent,
    KeywordListComponent,
    KeywordAddComponent,
    CustomKeywordActionComponent,
    CustomKeywordFilterActionsComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    KeywordsRoutingModule,
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
export class KeywordModule { }
