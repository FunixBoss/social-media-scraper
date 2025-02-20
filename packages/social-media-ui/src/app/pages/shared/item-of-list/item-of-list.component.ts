import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ngx-item-of-list',
  templateUrl: './item-of-list.component.html',
  styleUrls: ['./item-of-list.component.scss']
})
export class ItemOfListComponent implements OnInit {

  DEFAULT_OPTION = 50
  options = [50, 100, 200, 500]
  chosenOpt: number;

  @Output() selectNumberOfItem: EventEmitter<number> = new EventEmitter<number>()
  constructor() { }

  ngOnInit(): void {
    this.chosenOpt = localStorage.getItem('itemPerPage') != null
    ? +localStorage.getItem('itemPerPage') 
    : this.DEFAULT_OPTION
  }

  numberOfItemsChange(event: any) {
    this.selectNumberOfItem.emit(event)
    this.chosenOpt = event
    localStorage.setItem('itemPerPage', event.toString())
  }

}
