import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { InstagramComponent } from './instagram/instagram-profile/instagram.component';
import { InstagramConsoleComponent } from './instagram/instagram-console/instagram-console.component';
import { InstagramKeywordComponent } from './instagram/instagram-keyword/instagram-keyword.component';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    InstagramComponent,
    InstagramConsoleComponent,
    InstagramKeywordComponent,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
