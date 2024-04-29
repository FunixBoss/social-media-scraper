import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { CustomKeywordFilterActionsComponent } from './custom/custom-keyword-filter-actions.component';
import { CustomKeywordActionComponent } from './custom/custom-keyword-action.component';
import { KeywordService } from '../../../@core/services/keyword/keyword.service';
import FindAllKeywordDTO from '../../../@core/models/keyword/findall-keyword.dto';
import { CustomKeywordPriorityComponent } from "./custom/custom-keyword-priority.component";

@Component({
  selector: "ngx-keyword",
  templateUrl: "./keyword.component.html",
  styleUrls: ["./keyword.component.scss"],
})
export class KeywordListComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  state: string = "add"; // default
  loadedKeywords: boolean = false;

  // for deleting multi coupon
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  selectedKeywords: FindAllKeywordDTO[] = []
  deleteWindowRef: NbWindowRef;

  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 10; // default
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
      name: {
        title: "Keyword",
        type: "string",
        width: '10%'
      },
      total_channels: {
        title: "Total Channels",
        type: "string",
      },
      total_hashtags: {
        title: "Total Hashtags",
        type: "string",
      },
      priority: {
        title: "Priority",
        type: "string",
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomKeywordFilterActionsComponent
        },
        renderComponent: CustomKeywordActionComponent
      }
    },
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private keywordService: KeywordService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
  ) {}

  loadKeywords() {
    this.keywordService.findAll().subscribe(
      body => {
        const mappedKeywords = body.data.map((keyword) => {
          return {
            name: keyword.name,
            priority: keyword.priority,
            total_hashtags: keyword.total_channels,
            total_channels: keyword.total_hashtags
          }
        })
        this.source.load(mappedKeywords)
        this.loadedKeywords = true
      }
    )
  }

  ngOnInit() {
    this.keywordService.keywordChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadKeywords();
      });
    this.loadKeywords()
    this.keywordService.state$.subscribe((state) => {
      this.state = state;
    });
  }

  onRowSelect(event: any): void {
    this.selectedKeywords = (event.selected) as FindAllKeywordDTO[]
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Keywords` });
  }

  onDeleteKeywords() {
    this.keywordService.deleteKeywords(this.selectedKeywords).subscribe(
      data => {
        this.selectedKeywords = []
        this.deleteWindowRef.close()
        this.keywordService.notifyKeywordChange();
        this.utilsService.updateToastState(new ToastState('Delete The keywords Successfully!', "success"))
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Delete The keywords Failed!', "danger"))
        console.log(error);
      }
    )
  }
}
