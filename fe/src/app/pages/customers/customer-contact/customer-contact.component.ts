import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { DatePipe } from '@angular/common';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { Subject } from 'rxjs';
import { CustomCustomerContactActionComponent } from './custom-customer-contact-action.component';
import { ContactService } from '../../../@core/services/account/contact.service';
import { Contact } from '../../../@core/models/account/contact.model';
import { NbWindowRef, NbWindowService } from '@nebular/theme';

@Component({
  selector: "ngx-customer-contact",
  templateUrl: "./customer-contact.component.html",
  styleUrls: ["./customer-contact.component.scss"],
})
export class CustomerContactComponent implements OnInit, AfterViewInit {
  numberOfItem: number = localStorage.getItem('itemPerPage') != null ? +localStorage.getItem('itemPerPage') : 50; // default
  source: LocalDataSource = new LocalDataSource();
  private unsubscribe = new Subject<void>();

  @ViewChild('onDeleteTemplate') deleteWindow: TemplateRef<any>;
  deleteWindowRef: NbWindowRef;
  selectedContacts: Contact[] = []
  loadedContacts: boolean = false

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
      contactId: {
        title: 'Id',
        type: 'number',
        width: '5%'
      },
      email: {
        title: 'Email',
        type: 'string',
        width: "12%"
      },
      fullName: {
        title: 'Full Name',
        type: 'string',
        width: "12%"
      },
      phoneNumber: {
        title: 'Phone Number',
        type: 'string',
        width: "12%"
      },
      subject: {
        title: 'Subject',
        type: 'string',
        width: "12%"
      },
      message: {
        title: 'Message',
        type: 'string',
        width: "30%"
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        sort: false,
        filter: false,
        renderComponent: CustomCustomerContactActionComponent
      }
    },
    pager: {
      display: true,
      perPage: this.numberOfItem
    },
  }

  constructor(
    private contactService: ContactService,
    private utilsService: UtilsService,
    private windowService: NbWindowService
  ) { }

  ngOnInit(): void {
    this.contactService.contactChange$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.loadContacts();
      });
    this.loadContacts();
  }

  loadContacts() {
    this.contactService.findAll().subscribe(
      data => {
        const mappedContacts: any[] = data._embedded.contacts.map(contact => {
          return {
            contactId: contact.contactId,
            fullName: contact.fullName,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            subject: contact.subject,
            message: contact.message.length > 50 ? contact.message.substring(0, 50) + "..." : contact.message,
            createdAt: new DatePipe('en-US').transform(contact.createdAt, 'dd-MM-yyyy hh:mm'),
          }
        })
        this.source.load(mappedContacts)
        this.loadedContacts = true
      }
    )
  }

  ngAfterViewInit() {
    const pager = document.querySelector('ng2-smart-table-pager');
    pager.classList.add('d-block')
  }

  onRowSelect(event: any): void {
    this.selectedContacts = (event.selected) as Contact[]
  }

  onUpdateStatus(isUpdated: boolean) {
    if(isUpdated) {
      this.loadContacts();
      this.selectedContacts = []
      this.utilsService.updateToastState(new ToastState("Updated The Customers's Status Successfully!", "success"))
    } else {
      this.utilsService.updateToastState(new ToastState("Updated The Customers's Status Failed!", "danger"))
    }
  }

  openDeleteWindow() {
    this.deleteWindowRef = this.windowService
      .open(this.deleteWindow, { title: `Delete Contacts` });
  }

  onDeleteContacts() {
    this.contactService.deleteContacts(this.selectedContacts).subscribe(
      (result) => {
        this.selectedContacts = []
        this.deleteWindowRef.close()
        this.contactService.notifyContactChange();
        this.utilsService.updateToastState(new ToastState('Delete The Contacts Successfully!', "success"))
      },
      error => {
        this.utilsService.updateToastState(new ToastState('Delete The Contacts Failed!', "danger"))
        console.log(error);
      }
    )
  }
}
