import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductsComponent } from './products.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductCouponComponent } from './product-coupon/product-coupon.component';
import { ProductSaleComponent } from './product-sale/product-sale.component';
import { ProductCatalogComponent } from './product-catalog/product-catalog.component';

const routes: Routes = [{
  path: '',
  component: ProductsComponent,
  children: [
    {
      path: 'list',
      component: ProductListComponent,
    },
    {
      path: 'add',
      component: ProductAddComponent,
    },
    {
      path: 'edit/:id',
      component: ProductEditComponent,
    },
    {
      path: 'detail/:id',
      component: ProductDetailComponent,
    },
    {
      path: 'catalog',
      component: ProductCatalogComponent,
    },
    {
      path: 'coupon',
      component: ProductCouponComponent,
    },
    {
      path: 'product-sale',
      component: ProductSaleComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule { }

export const routedComponents = [
  ProductsComponent,
  ProductListComponent,
  ProductAddComponent,
  ProductEditComponent,
  ProductDetailComponent,
  ProductCatalogComponent,
  ProductCouponComponent,
  ProductSaleComponent
];
