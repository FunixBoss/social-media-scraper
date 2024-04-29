import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { ActivatedRoute } from "@angular/router";
import ChannelFriendshipDTO from "../../../@core/models/channel/channel-friendship.dto";
import { ChannelService } from "../../../@core/services/channel/channel.service";
import { CustomLinkComponent } from "../shared/custom-link.component";

@Component({
  selector: "ngx-channel-friendships",
  templateUrl: "./channel-friendships.component.html",
  styleUrls: ["./channel-friendships.component.scss"],
})
export class ChannelFriendshipsComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  loadedFriendships: boolean = false;
  channel_username: string;
  selectedFriendships: ChannelFriendshipDTO[] = []

  defaultItems: number = 50;
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : this.defaultItems; // default
  source: LocalDataSource = new LocalDataSource();
  settings = {
    selectMode: 'multi',
    actions: {
      edit: false,
      delete: false,
      add: false,
      columnTitle: ''
    },
    mode: "external", // when add/edit -> navigate to another url
    columns: {
      username: {
        title: "Username",
        type: "custom",
        width: "7%",
        renderComponent: CustomLinkComponent
      },
      full_name: {
        title: "Full name",
        type: "string",
      },
      // actions: {
      //   title: 'Actions',
      //   type: 'custom',
      //   sort: false,
      //   filter: {
      //     type: 'custom',
      //     component: CustomFriendshipFilterActionsComponent
      //   },
      //   renderComponent: CustomFriendshipActionComponent
      // }
    },
    pager: {
      display: false,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private channelService: ChannelService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.channel_username = params['username']
        this.loadFriendships()
      });
    this.channelService.channelChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadFriendships();
      });
  }

  loadFriendships() {
    this.channelService.findFriendships(this.channel_username)
      .subscribe(body => {
        const mappedFriendships = body.data.map((friendship) => {
          const { username, full_name, url, channel_username } = friendship
          return {
            username,
            full_name,
            url,
            channel_username,
          }
        })
        this.source.load(mappedFriendships)
        this.settings = {
          ...this.settings,
          pager: {
            display: true,
            perPage: this.numberOfItem
          }
        }
        this.loadedFriendships = true
      })
  }

  onRowSelect(event: any): void {
    this.selectedFriendships = (event.selected) as ChannelFriendshipDTO[]
  }
}
