import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../@core/services/account/authentication.service';

@Component({
  selector: 'ngx-logout',
  template: '<p></p>',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent  {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.authService.logout()
    this.authService.authChange()
    this.router.navigateByUrl('/admin/auth/login')
  }

  
}
