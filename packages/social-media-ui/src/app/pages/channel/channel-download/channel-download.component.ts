import { ChannelDownloadHistoryDTO } from './../../../@core/models/channel/channel-download-history.dto';
import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit, AfterViewChecked } from "@angular/core";
import { LocalDataSource } from "ng2-smart-table";
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { ActivatedRoute } from "@angular/router";
import { CustomChannelDownloadPriorityComponent } from './custom/custom-channel-download-priority.component';
import { ChannelService } from '../../../@core/services/channel/channel.service';
import { DatePipe } from '@angular/common';
import { CustomChannelDownloadFilterActionsComponent } from './custom/custom-channel-download-filter-actions.component';
import { CustomChannelDownloadActionComponent } from './custom/custom-channel-download-action.component';
import { ChannelDownloadService } from '../../../@core/services/channel/channel-download.service';

@Component({
  selector: "ngx-channel-download",
  templateUrl: "./channel-download.component.html",
  styleUrls: ["./channel-download.component.scss"],
})
export class ChannelDownloadListComponent implements OnInit {
  private unsubscribe = new Subject<void>();
  loadedDownloads: boolean = false;
  channel_username: string

  // for deleting multi coupon 
  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  deleteWindowRef: NbWindowRef;
  selectedDownloads: ChannelDownloadHistoryDTO[] = []

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
        title: "Id",
        type: "number",
        width: "7%"
      },
      download_type: {
        title: "Type",
        type: "string",
        width: '10%'
      },
      from_order: {
        title: "From",
        type: "number",
      },
      to_order: {
        title: "To",
        type: "number",
      },
      date: {
        title: "Date",
        type: "string",
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: {
          type: 'custom',
          component: CustomChannelDownloadFilterActionsComponent
        },
        renderComponent: CustomChannelDownloadActionComponent
      }
    },
    pager: {
      display: false,
      perPage: this.numberOfItem
    },
  };

  constructor(
    private channelDownloadService: ChannelDownloadService,
    private utilsService: UtilsService,
    private windowService: NbWindowService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.channel_username = params['username']
        this.loadDownloads()
      });
    this.channelDownloadService.downloadChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadDownloads();
      });
  }

  loadDownloads() {
    this.loadedDownloads = false
    this.channelDownloadService.findAllDownloadHistories(this.channel_username)
      .subscribe(body => {
        const mappedDownloads = body.data.map((download) => {
          const { id, download_type, from_order, to_order, date } = download
          return {
            id,
            download_type,
            from_order,
            to_order,
            date: date ? new DatePipe('en-US').transform(date, 'dd/MM/yyyy').toString(): undefined,
            username: this.channel_username
          }
        })
        this.source.load(mappedDownloads.sort((a, b) => b.id - a.id))
        this.settings = {
          ...this.settings,
          pager: {
            display: true,
            perPage: this.numberOfItem
          }
        }
        this.loadedDownloads = true
      })
  }

  onRowSelect(event: any): void {
    this.selectedDownloads = (event.selected) as ChannelDownloadHistoryDTO[]
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Downloads` });
  }

  onDeleteDownloads() {
    // this.channelService.deleteDownloads(this.selectedDownloads).subscribe(
    //   data => {
    //     this.selectedDownloads = []
    //     this.deleteWindowRef.close()
    //     this.channelService.notifyDownloadChange();
    //     this.utilsService.updateToastState(new ToastState('Delete The downloads Successfully!', "success"))
    //   },
    //   error => {
    //     this.utilsService.updateToastState(new ToastState('Delete The downloads Failed!', "danger"))
    //     console.log(error);
    //   }
    // )
  }
}
