import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-status-card',
  template: `
  <nb-card (click)="on = !on" [ngClass]="{'off': !on}">
    <div class="icon-container">
      <div class="icon status-{{ type }}">
        <ng-content></ng-content>
      </div>
    </div>

    <div class="details">
      <div class="title h5">{{ title }}</div>
      <div class="status paragraph-2">{{ value }}</div>
    </div>
  </nb-card>
`,  styleUrls: ['./status-card.component.scss']
})
export class StatusCardComponent {

  @Input() title: string;
  @Input() value: number;
  @Input() type: string;
  @Input() on = true;
  
  constructor() { }
}
