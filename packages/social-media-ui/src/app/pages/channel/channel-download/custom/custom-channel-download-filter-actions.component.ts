import { Component } from '@angular/core';
import { ChannelService } from '../../../../@core/services/channel/channel.service';

@Component({
    selector: 'ngx-custom-catalog-filter-actions',
    template: `
        <button nbButton fullWidth="" status="primary" (click)="onReset()">
            <nb-icon icon="refresh-outline"></nb-icon>
        </button>
    `,
})
export class CustomChannelDownloadFilterActionsComponent {

    constructor(private channelService: ChannelService) { }

    onReset() {
        this.channelService.notifyChannelChange()
    }
}