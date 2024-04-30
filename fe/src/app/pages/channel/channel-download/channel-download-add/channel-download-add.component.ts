import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastState, UtilsService } from "../../../../@core/services/utils.service";
import { CustomValidator } from "../../../../@core/validators/custom-validator";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { ChannelService } from '../../../../@core/services/channel/channel.service';

@Component({
  selector: "ngx-channel-download-add",
  templateUrl: "./channel-download-add.component.html",
  styleUrls: ["./channel-download-add.component.scss"],
})
export class ChannelDownloadAddComponent {

  @Input() username: string;
  addDownloadFormGroup: FormGroup;
  downloadTypes: String[] = ["REELS", "POSTS"]
  createLoading = false;

  constructor(
    private channelService: ChannelService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService,
  ) {
    this.addDownloadFormGroup = this.formBuilder.group({
      download_type: ['', [CustomValidator.notBlank, Validators.maxLength(100)]],
      from_order: [1, [CustomValidator.notBlank, Validators.min(1)]],
      to_order: [100, [CustomValidator.notBlank, Validators.min(1)]]
    })
  }

  createDownload() {
    if (this.addDownloadFormGroup.invalid) {
      this.addDownloadFormGroup.markAllAsTouched();
      this.utilsService.updateToastState(new ToastState('Add Download Failed!', "danger"))
      return;
    }

    this.createLoading = true
    const downloadType = this.addDownloadFormGroup.get('download_type').value
    const fromOrder = this.addDownloadFormGroup.get('from_order').value
    const toOrder = this.addDownloadFormGroup.get('to_order').value

    this.channelService.downloadChannel(this.username, downloadType, fromOrder, toOrder)
      .pipe(
        catchError(error => {
          // Log the error or handle it as needed
          console.error('Error occurred while adding a download:', error);
          this.createLoading = false;
          this.utilsService.updateToastState(new ToastState('Failed to add download!', "danger"));
          return of(null); // Return a null observable so the stream remains alive
        })
      )
      .subscribe(data => {
        if (data) {
          this.createLoading = false
          this.channelService.notifyChannelChange();
          this.utilsService.updateToastState(new ToastState('Add Download Successfully!', "success"))
          this.reset()
        }
      })
  }

  reset() {
    this.addDownloadFormGroup.reset();
  }
}
