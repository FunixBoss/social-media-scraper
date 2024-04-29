import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbAccordionModule, NbActionsModule, NbAutocompleteModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbIconComponent, NbIconModule, NbInputModule, NbRadioModule, NbSelectModule, NbSpinnerModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { Ng2CompleterModule } from 'ng2-completer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemeModule } from '../../@theme/theme.module';
import { SharedModule } from '../shared/shared.module';
import { HashtagComponent } from './hashtag.component';
import { HashtagListComponent } from './list/hashtag.component';
import { HashtagAddComponent } from './list/hashtag-add/hashtag-add.component';
import { CustomHashtagActionComponent } from './list/custom/custom-hashtag-action.component';
import { HashtagsRoutingModule } from './hashtag-routing.module';
import { CustomHashtagFilterActionsComponent } from './list/custom/custom-hashtag-filter-actions.component';
import { CustomHashtagPriorityComponent } from './list/custom/custom-hashtag-priority.component';



@NgModule({
  declarations: [
    HashtagComponent,
    HashtagListComponent,
    HashtagAddComponent,
    CustomHashtagActionComponent,
    CustomHashtagFilterActionsComponent,
    CustomHashtagPriorityComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    HashtagsRoutingModule,
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
export class HashtagModule { }
