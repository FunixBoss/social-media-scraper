import { NgModule } from '@angular/core';
import { NbAccordionModule, NbActionsModule, NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbListModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbStepperComponent, NbStepperModule, NbTreeGridModule, NbUserModule } from '@nebular/theme';
import { NbTabsetModule } from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { ProductsRoutingModule, routedComponents } from './products-routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomProductActionComponent } from './product-list/custom/custom-product-action.component';
import { CustomProductFilterActionsComponent } from './product-list/custom/custom-product-filter-actions.component';
import { ImagesCarouselComponent } from './images-carousel.component';
import { CustomCouponActionComponent } from './product-coupon/custom/custom-coupon-action.component';
import { CustomCouponFilterActionsComponent } from './product-coupon/custom/custom-coupon-filter-actions.component';
import { ProductCouponAddComponent } from './product-coupon/product-coupon-add/product-coupon-add.component';
import { ProductCouponEditComponent } from './product-coupon/product-coupon-edit/product-coupon-edit.component';
import { CustomSaleFilterActionsComponent } from './product-sale/custom/custom-sale-filter-actions.component';
import { ProductSaleAddComponent } from './product-sale/product-sale-add/product-sale-add.component';
import { ProductSaleEditComponent } from './product-sale/product-sale-edit/product-sale-edit.component';
import { CustomSaleActionComponent } from './product-sale/custom/custom-sale-action.component';
import { CustomSaleActiveActionComponent } from './product-sale/custom/custom-sale-active-action.component';
import { ProductSaleMultiComponent } from './product-sale/product-sale-multi/product-sale-multi.component';
import { CustomProductStatusComponent } from './product-list/custom/custom-product-status.component';
import { CustomProductStatusFilterComponent } from './product-list/custom/custom-product-status-filter.component';
import { ProductListMultiComponent } from './product-list/product-list-multi/product-list-multi.component';
import { ProductDetailBasicComponent } from './product-detail/product-detail-basic/product-detail-basic.component';
import { ProductDetailCommentsComponent } from './product-detail/product-detail-comments/product-detail-comments.component';
import { NgbModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomCatalogActionComponent } from './product-catalog/custom/custom-catalog-action.component';
import { CustomCatalogFilterActionsComponent } from './product-catalog/custom/custom-catalog-filter-actions.component';
import { CustomCatalogImageComponent } from './product-catalog/custom/custom-catalog-image.component';
import { ProductCatalogAddComponent } from './product-catalog/product-catalog-add/product-catalog-add.component';
import { ProductCatalogEditComponent } from './product-catalog/product-catalog-edit/product-catalog-edit.component';
import { ProductDetailCareGuideComponent } from './product-detail/product-detail-care-guide/product-detail-care-guide.component';
import { SharedModule } from '../shared/shared.module';
import { FormBasicInformationComponent } from './shared/form-basic-information/form-basic-information.component';
import { FormVariantsComponent } from './shared/form-variants/form-variants.component';
import { FormCareGuideComponent } from './shared/form-care-guide/form-care-guide.component';

@NgModule({
  imports: [
    // for forms
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbSelectModule,
    NbAccordionModule,
    // forlayout
    NbCardModule,
    NbTabsetModule,
    ThemeModule,
    Ng2SmartTableModule,
    NbListModule,
    ProductsRoutingModule,
    CKEditorModule,
    FormsModule,
    ReactiveFormsModule,
    NbIconModule,
    NbAlertModule,
    NgbRatingModule,
    NbFormFieldModule,
    NbTreeGridModule,
    NbStepperModule,
    SharedModule,
    NbSpinnerModule
  ],
  declarations: [
    ...routedComponents,
    CustomProductActionComponent,
    CustomProductFilterActionsComponent,
    CustomProductStatusComponent,
    ImagesCarouselComponent,
    CustomProductStatusFilterComponent,
    ProductListMultiComponent,

    CustomCatalogActionComponent,
    CustomCatalogFilterActionsComponent,
    CustomCatalogImageComponent,
    ProductCatalogAddComponent,
    ProductCatalogEditComponent,

    CustomCouponActionComponent,
    CustomCouponFilterActionsComponent,
    ProductCouponAddComponent,
    ProductCouponEditComponent,

    CustomSaleActionComponent,
    CustomSaleFilterActionsComponent,
    CustomSaleActiveActionComponent,
    ProductSaleAddComponent,
    ProductSaleEditComponent,
    ProductSaleMultiComponent,

    ProductDetailBasicComponent,
    ProductDetailCommentsComponent,
    ProductDetailCareGuideComponent,
    
    FormBasicInformationComponent,
    FormVariantsComponent,
    FormCareGuideComponent
  ],
})
export class ProductsModule { }
