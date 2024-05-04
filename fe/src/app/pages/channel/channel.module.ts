import { NgModule } from '@angular/core';
import { NbAccordionModule, NbActionsModule, NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbFormFieldModule, NbIconModule, NbInputModule, NbListModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbStepperComponent, NbStepperModule, NbTreeGridModule, NbUserModule } from '@nebular/theme';
import { NbTabsetModule } from '@nebular/theme';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { ChannelsRoutingModule, routedComponents } from './channel-routing.module';
import { CustomLinkComponent } from './shared/custom-link.component';
import { CustomChannelActionComponent } from './channel-list/custom/custom-channel-action.component';
import { CustomChannelStatusFilterComponent } from './channel-list/custom/custom-channel-status-filter.component';
import { CustomChannelFilterActionsComponent } from './channel-list/custom/custom-channel-filter-actions.component';
import { CustomChannelStatusComponent } from './channel-list/custom/custom-channel-status.component';
import { ChannelListMultiComponent } from './channel-list/channel-list-multi/channel-list-multi.component';
import { CustomChannelReelLinkComponent } from './channel-list/custom/custom-channel-reel-link.component';
import { CustomInstaReelLinkComponent } from './channel-reels/custom/custom-insta-reel-link.component';
import { CustomInstaPostLinkComponent } from './channel-posts/custom/custom-insta-post-link.component';
import { CustomChannelPostLinkComponent } from './channel-list/custom/custom-channel-post-link.component';
import { CustomPriorityComponent } from './shared/custom-priority.component';
import { CustomChannelFriendshipLinkComponent } from './channel-list/custom/custom-channel-friend-link.component';
import { ChannelDownloadAddComponent } from './channel-download/channel-download-add/channel-download-add.component';
import { CustomChannelDownloadActionComponent } from './channel-download/custom/custom-channel-download-action.component';
import { CustomChannelDownloadFilterActionsComponent } from './channel-download/custom/custom-channel-download-filter-actions.component';
import { CustomChannelDownloadPriorityComponent } from './channel-download/custom/custom-channel-download-priority.component';
import { CustomChannelFollowerComponent } from './channel-list/custom/custom-channel-follower.component';

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
    ChannelsRoutingModule,
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
    CustomLinkComponent,
    CustomChannelActionComponent,
    CustomChannelFilterActionsComponent,
    CustomChannelStatusFilterComponent,
    CustomChannelStatusComponent,
    ChannelListMultiComponent,
    CustomPriorityComponent,

    CustomChannelFollowerComponent,
    CustomChannelReelLinkComponent,
    CustomInstaReelLinkComponent,
    CustomInstaPostLinkComponent,
    CustomChannelPostLinkComponent,
    CustomChannelFriendshipLinkComponent,

    ChannelDownloadAddComponent,
    CustomChannelDownloadActionComponent,
    CustomChannelDownloadFilterActionsComponent,
    CustomChannelDownloadPriorityComponent
    // ImagesCarouselComponent,,
    // CustomProductActionComponent,
    // CustomProductFilterActionsComponent,
    // CustomProductStatusComponent,
    // CustomProductStatusFilterComponent,
    // ProductListMultiComponent,

    // CustomCatalogImageComponent,
    // ProductCatalogAddComponent,
    // ProductCatalogEditComponent,

    // CustomCouponActionComponent,
    // CustomCouponFilterActionsComponent,
    // ProductCouponAddComponent,
    // ProductCouponEditComponent,

    // CustomSaleActionComponent,
    // CustomSaleFilterActionsComponent,
    // CustomSaleActiveActionComponent,
    // ProductSaleAddComponent,
    // ProductSaleEditComponent,
    // ProductSaleMultiComponent,

    // ProductDetailBasicComponent,
    // ProductDetailCommentsComponent,
    // ProductDetailCareGuideComponent,
  ],
})
export class ChannelsModule { }
