import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { ActivatedRoute } from "@angular/router";
import { ChannelService } from "../../../@core/services/channel/channel.service";
import { CustomLinkComponent } from "../shared/custom-link.component";
import ChannelReelDTO from '../../../@core/models/channel/channel-reel.dto';
import { CustomInstaReelLinkComponent } from "./custom/custom-insta-reel-link.component";

@Component({
  selector: "ngx-channel-reels",
  templateUrl: "./channel-reels.component.html",
  styleUrls: ["./channel-reels.component.scss"],
})
export class ChannelReelsListComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  loadedReels: boolean = false;
  channel_username: string;
  selectedReels: ChannelReelDTO[] = []

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
    mode: "external",
    columns: {
      channel_reel_numerical_order: {
        title: "Order",
        type: "number",
        width: "7%"
      },
      code: {
        title: "Code",
        type: "custom",
        width: "10%",
        renderComponent: CustomInstaReelLinkComponent
      },
      comment_count: {
        title: "Comments",
        type: "number",
      },
      like_count: {
        title: "Likes",
        type: "number",
      },
      play_count: {
        title: "Plays",
        type: "number",
      },
    },
    pager: {
      display: false,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.channel_username = params['username']
        this.loadReels()
      });
    this.channelService.channelChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadReels();
      });
  }

  loadReels() {
    this.channelService.findReels(this.channel_username)
      .subscribe(body => {
        const mappedReels = body.data.map((reel) => {
          const { channel_reel_numerical_order, code, url, like_count, play_count, comment_count } = reel
          return {
            channel_reel_numerical_order,
            code,
            url,
            like_count,
            play_count,
            comment_count,
          }
        })
        this.source.load(mappedReels)
        this.settings = {
          ...this.settings,
          pager: {
            display: true,
            perPage: this.numberOfItem
          }
        }
        this.loadedReels = true
      })
  }

  onRowSelect(event: any): void {
    this.selectedReels = (event.selected) as ChannelReelDTO[]
  }

}
