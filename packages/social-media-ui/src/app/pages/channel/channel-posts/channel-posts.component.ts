import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from "@angular/router";
import ChannelPostDTO from '../../../@core/models/channel/channel-post.dto';
import { ChannelService } from "../../../@core/services/channel/channel.service";
import { CustomInstaPostLinkComponent } from "./custom/custom-insta-post-link.component";

@Component({
  selector: "ngx-channel-posts",
  templateUrl: "./channel-posts.component.html",
  styleUrls: ["./channel-posts.component.scss"],
})
export class ChannelPostsListComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  loadedPosts: boolean = false;
  selectedPosts: ChannelPostDTO[] = []
  channel_username: string;

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
      channel_post_numerical_order: {
        title: "Order",
        type: "number",
        width: "7%"
      },
      code: {
        title: "Code",
        type: "custom",
        renderComponent: CustomInstaPostLinkComponent
      },
      like_count: {
        title: "Likes",
        type: "number",
      },
      comment_count: {
        title: "Comments",
        type: "string",
      },
      product_type: {
        title: "Post Type",
        type: "string",
      },
      // actions: { 
      //   title: 'Actions',
      //   type: 'custom',
      //   sort: false,
      //   filter: {
      //     type: 'custom',
      //     component: CustomPostFilterActionsComponent
      //   },
      //   renderComponent: CustomPostActionComponent
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
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.channel_username = params['username']
        this.loadPosts()
      });
    this.channelService.channelChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadPosts();
      });
  }

  loadPosts() {
    this.channelService.findPosts(this.channel_username)
      .subscribe(body => {
        const mappedPosts = body.data.map((post) => {
          const { code, url, channel_post_numerical_order, product_type, like_count, comment_count } = post
          return {
            code,
            url,
            channel_post_numerical_order,
            product_type,
            like_count,
            comment_count
          }
        })
        this.source.load(mappedPosts)
        this.settings = {
          ...this.settings,
          pager: {
            display: true,
            perPage: this.numberOfItem
          }
        }
        this.loadedPosts = true
      })
  }

  onRowSelect(event: any): void {
    this.selectedPosts = (event.selected) as ChannelPostDTO[]
  }

}
