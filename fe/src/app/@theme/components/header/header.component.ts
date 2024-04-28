import { ACCOUNT_IMAGE_DIRECTORY } from './../../../@core/utils/image-storing-directory';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserService } from '../../../@core/services/users.service';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../@core/services/account/authentication.service';
import { Account } from '../../../@core/models/account/account.model';
import { Router } from '@angular/router';
import { AccountService } from '../../../@core/services/account/account.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  currentTheme = localStorage.getItem("theme") != null ? localStorage.getItem("theme") : 'default';
  themes = [
    { value: 'default', name: 'Light'},
    { value: 'dark', name: 'Dark'}
  ];

  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    public authService: AuthenticationService,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.authService.authChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserProfile();
      });
    this.loadUserProfile();

    this.accountService.accountChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUserProfile();
      })
    this.loadUserProfile();

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
    localStorage.setItem("theme", themeName)
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  changeProfile() {
    this.router.navigateByUrl("/admin/change-profile")
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  loadUserProfile() {
    if(this.authService.isLoggedIn()) {
      const loggedInAccount: any = this.authService.getAccountFromLocalCache()
      loggedInAccount.image = loggedInAccount.image != null ? ACCOUNT_IMAGE_DIRECTORY + loggedInAccount.image.imageUrl : null
      this.user =loggedInAccount
    }
  }
}
