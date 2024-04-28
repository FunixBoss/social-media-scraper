import { AuthenticationService } from './../services/account/authentication.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ToastState, UtilsService } from '../services/utils.service';
import { BaseURLService } from '../services/base-url.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private utilsService: UtilsService,
    private baseUrlService: BaseURLService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      console.log(this.baseUrlService.baseURL);
      
    return state.url.includes("/admin/auth/login") || this.isAccountLoggedIn(state) ;
  }

  private isAccountLoggedIn(state: RouterStateSnapshot): boolean {
    if(this.authenticationService.isLoggedIn()) return true;
    
    this.router.navigateByUrl('/admin/auth/login')

    if(!(state.url == '/admin/dashboard')) {
      setTimeout(() => {
        this.utilsService.updateToastState(new ToastState('You need to log in to access this page!', "danger"))
      }, 500);
    }
    return false;
  }
}
