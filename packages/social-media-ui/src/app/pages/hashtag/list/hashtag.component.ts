import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { CustomHashtagFilterActionsComponent } from './custom/custom-hashtag-filter-actions.component';
import { CustomHashtagActionComponent } from './custom/custom-hashtag-action.component';
import { HashtagService } from '../../../@core/services/keyword/hashtag.service';
import FindAllHashtagDTO from '../../../@core/models/hashtag/findall-hashtag.dto';
import { CustomHashtagPriorityComponent } from "./custom/custom-hashtag-priority.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "ngx-hashtag",
  templateUrl: "./hashtag.component.html",
  styleUrls: ["./hashtag.component.scss"],
})
export class HashtagListComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  state: string = "add"; // default
  loadedHashtags: boolean = false;

  // for deleting multi coupon 
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  selectedHashtags: FindAllHashtagDTO[] = []
  deleteWindowRef: NbWindowRef;

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
      id: {
        Title: "Id",
        type: "number",
        width: "7%"
      },
      code: {
        title: "Hashtag",
        type: "string",
        width: '10%'
      },
      media_count: {
        title: "Posts",
        type: "number",
      },
      is_bot_scanning: {
        title: "Bot Scan",
        type: "string",
      },
      is_self_adding: {
        title: "Self Adding",
        type: "string",
      },
      priority: {
        title: "Priority",
        type: "custom",
        renderComponent: CustomHashtagPriorityComponent
      },
      keyword: {
        title: "Keyword",
        type: "string"
      },
      // actions: {
      //   title: 'Actions',
      //   type: 'custom',
      //   sort: false,
      //   filter: {
      //     type: 'custom',
      //     component: CustomHashtagFilterActionsComponent
      //   },
      //   renderComponent: CustomHashtagActionComponent
      // }
    },
    pager: {
      display: false,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private hashtagService: HashtagService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        const keyword = params['keyword'];
        console.log(keyword); // gardening

        this.loadHashtags(keyword)
      });
    this.hashtagService.hashtagChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadHashtags();
      });
    this.hashtagService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  loadHashtags(keyword?: string) {
    this.hashtagService.findAll(keyword)
      .subscribe(body => {
        const mappedHashtags = body.data.map((hashtag) => {
          const { id, code, media_count, category, is_self_adding, is_bot_scanning, priority, keyword } = hashtag
          return {
            id,
            code: `#${code}`,
            media_count,
            category,
            is_bot_scanning,
            is_self_adding,
            priority,
            keyword
          }
        })
        this.source.load(mappedHashtags)
        this.settings = {
          ...this.settings,
          pager: {
            display: true,
            perPage: this.numberOfItem
          }
        }
        this.loadedHashtags = true
      })
  }

  onRowSelect(event: any): void {
    this.selectedHashtags = (event.selected) as FindAllHashtagDTO[]
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Hashtags` });
  }

  onDeleteHashtags() {
    this.hashtagService.deleteHashtags(this.selectedHashtags).subscribe(
      data => {
        this.selectedHashtags = []
        this.deleteWindowRef.close()
        this.hashtagService.notifyHashtagChange();
        this.utilsService.updateToastState(new ToastState('Delete The hashtags Successfully!', "success"))
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Delete The hashtags Failed!', "danger"))
        console.log(error);
      }
    )
  }
}
