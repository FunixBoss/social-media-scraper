import { Component } from '@angular/core';
import { MENU_ITEMS_AUTHORIZED } from './pages-menu';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `, 
})
export class PagesComponent {

  menu: NbMenuItem[]

  constructor(
  ) {
    this.loadMenu()
  }

  loadMenu() {
    this.menu = MENU_ITEMS_AUTHORIZED
  }


}
