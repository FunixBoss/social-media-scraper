import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LocalDataSource, Ng2SmartTableComponent } from 'ng2-smart-table';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { ChannelService, FindAllChannelQueryOption } from '../../../@core/services/channel/channel.service';
import { CustomLinkComponent } from '../shared/custom-link.component';
import { CustomChannelActionComponent } from './custom/custom-channel-action.component';
import { Subject } from 'rxjs';
import { CustomChannelFilterActionsComponent } from './custom/custom-channel-filter-actions.component';
import { CustomChannelReelLinkComponent } from './custom/custom-channel-reel-link.component';
import { CustomChannelPostLinkComponent } from './custom/custom-channel-post-link.component';
import { CustomPriorityComponent } from '../shared/custom-priority.component';
import { CustomChannelFriendshipLinkComponent } from './custom/custom-channel-friend-link.component';
import { ActivatedRoute } from '@angular/router';
import { CustomChannelFollowerComponent } from './custom/custom-channel-follower.component';

@Component({
  selector: 'ngx-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss']
})
export class ChannelListComponent implements OnInit, AfterViewInit {
  private unsubscribe = new Subject<void>();
  defaultItems = 50;
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : this.defaultItems;
  source: LocalDataSource = new LocalDataSource();
  queryOptions?: FindAllChannelQueryOption;
  loadedList: boolean = false;

  // for select multi
  selectedChannels: any[] = []
  settings = {
    selectMode: 'multi',
    actions: {
      position: 'right',
      edit: false,
      delete: false,
      add: false,
      columnTitle: ''
    },
    columns: {
      username: {
        title: 'Username',
        type: 'custom',
        width: '5%',
        renderComponent: CustomLinkComponent
      },
      full_name: {
        title: 'Name',
        type: 'string',
        width: '5%'
      },
      category: {
        title: 'Category',
        type: 'string',
        width: '5%'
      },
      follower_count: {
        title: 'Follower',
        type: 'custom',
        width: '5%',
        renderComponent: CustomChannelFollowerComponent,
        sortDirection: 'desc'
      },
      total_posts: {
        title: 'Posts',
        type: 'custom',
        width: '5%',
        renderComponent: CustomChannelPostLinkComponent,
      },
      total_reels: {
        title: 'Reels',
        type: 'custom',
        width: '5%',
        renderComponent: CustomChannelReelLinkComponent
      },
      total_friendships: {
        title: 'Friendships',
        type: 'custom',
        width: '5%',
        renderComponent: CustomChannelFriendshipLinkComponent,
      },
      biography: {
        title: "Biography",
        type: 'string',
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomChannelFilterActionsComponent,
        },
        renderComponent: CustomChannelActionComponent
      },
    },
    
    sortDirection: 'desc',
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  };


  constructor(
    private channelService: ChannelService,
    private utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      console.log(params);
      
      this.queryOptions = {
        keyword: params.get('keyword'),
        friendshipsOf: params.get('friendshipsOf')
      }
    });
    this.channelService.channelChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadChannels();
      });
    this.loadChannels();
  }

  loadChannels() {
    this.loadedList = false
    this.channelService.findAll(this.queryOptions)
      .subscribe(body => {
        if (body) {
          const mappedChannels: any[] = body.data.reverse().map(channel => {
            const { username, profile_pic_url, media_count, full_name, category, biography, follower_count, total_posts, total_reels, total_friendships, priority, url, crawled } = channel;
            return {
              username,
              full_name,
              category,
              follower_count,
              total_posts: total_posts || media_count,
              total_reels: total_reels || '',
              media_count,
              total_friendships: total_friendships || '',
              priority,
              url,
              biography,
              profile_pic_url,
              onlyHasMediaCount: media_count && !total_posts,
              crawled: crawled.sort((a: any, b: any) => (a - b)).map(crawl => crawl.replace("CHANNEL_", "")).join("\n")
            }
          })
          this.source.load(mappedChannels)
          this.loadedList = true
        }
      })
  }

  ngAfterViewInit() {
    const pager = document.querySelector('ng2-smart-table-pager');
    if (pager != null) {
      pager.classList.add('d-block')
    }
  }

  onRowSelect(event: any): void {
    this.selectedChannels = (event.selected)
  }

  onDelete(isDeleted: boolean) {
    if (isDeleted) {
      this.loadChannels();
      this.selectedChannels = []
      this.utilsService.updateToastState(new ToastState('Delete The Channel\'s Status Successfully!', "success"))
    } else {
      this.utilsService.updateToastState(new ToastState('Delete The Channel\'s Status Failed!', "danger"))
    }
  }

  onUpdateNewStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedChannels = []
      this.loadChannels();
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status New Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status New Failed!", "danger"))
    }
  }

  onUpdateTopStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedChannels = []
      this.loadChannels();
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status Top Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status Top Failed!", "danger"))
    }
  }

  onUpdateActiveStatus(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedChannels = []
      this.loadChannels();
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status Active Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Status Active Failed!", "danger"))
    }
  }

  onAppliedSale(isAppliedSale: boolean) {
    if (isAppliedSale) {
      this.selectedChannels = []
      this.loadChannels();
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Sale Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Channel's Sale Failed!", "danger"))
    }
  }

  onUpdateStatuses(isUpdated: boolean) {
    if (isUpdated) {
      this.selectedChannels = []
      this.loadChannels();
      this.utilsService.updateToastState(new ToastState("Updated Statuses Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated Statuses Failed!", "danger"))
    }
  }
}
