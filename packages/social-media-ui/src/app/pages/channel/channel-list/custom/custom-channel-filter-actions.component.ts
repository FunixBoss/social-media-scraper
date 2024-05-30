import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DefaultFilter } from 'ng2-smart-table';
import { ChannelService } from '../../../../@core/services/channel/channel.service';

@Component({
    template: `
        <button nbButton fullWidth="" status="primary" (click)="onReset()">
            <nb-icon icon="refresh-outline"></nb-icon>
        </button>
    `,
})
export class CustomChannelFilterActionsComponent extends DefaultFilter implements OnInit, OnChanges {

    constructor(private channelService: ChannelService) {
        super();
    }

    ngOnInit() {
        let x
    }

    ngOnChanges(changes: SimpleChanges) {
        let x
    }

    onReset() {
        this.channelService.notifyChannelChange()
    }

}