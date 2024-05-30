import { NgModule } from '@angular/core';
import { NbMenuModule, NbSearchModule, NbSelectModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from './shared/shared.module';
import { KeywordModule } from './keyword/keyword.module';
import { HashtagModule } from './hashtag/hashtag.module';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule, // @theme
    NbMenuModule,
    SharedModule,
    KeywordModule,
    HashtagModule,
    NbSearchModule,
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule { }
