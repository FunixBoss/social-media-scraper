import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ngx-item-of-list',
  templateUrl: './item-of-list.component.html',
  styleUrls: ['./item-of-list.component.scss']
})
export class ItemOfListComponent {

  DEFAULT_OPTION = 10
  options = [5, 10, 20, 50]
  chosenOpt: number = localStorage.getItem('itemPerPage') != null ?
    +localStorage.getItem('itemPerPage') : this.DEFAULT_OPTION

  @Output() selectNumberOfItem: EventEmitter<number> = new EventEmitter<number>()
  constructor() { }

  numberOfItemsChange(event: any) {
    this.selectNumberOfItem.emit(event)
    this.chosenOpt = event
    localStorage.setItem('itemPerPage', event.toString())
  }

}
