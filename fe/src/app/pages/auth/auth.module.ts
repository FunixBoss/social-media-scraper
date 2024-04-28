import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbInputModule, NbMenuModule, NbSpinnerModule } from '@nebular/theme';
import { NbAuthModule } from '@nebular/auth';
import { LogoutComponent } from './logout/logout.component';
import { AuthComponent } from './auth.component';
import { ThemeModule } from '../../@theme/theme.module';
import { AuthRoutingModule } from './auth-routing.module';



@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    AuthComponent
  ],
  imports: [
    AuthRoutingModule,
    CommonModule,
    CommonModule,
    FormsModule,
    RouterModule,
    NbAlertModule,
    NbInputModule,
    NbButtonModule,
    NbCheckboxModule,
    NbAuthModule,
    NbCardModule,
    ReactiveFormsModule,
    ThemeModule, // @theme
    NbMenuModule,
    NbSpinnerModule
  ],
  exports: [
    LoginComponent,
    LogoutComponent,
    AuthComponent
  ]
})
export class AuthModule { }
