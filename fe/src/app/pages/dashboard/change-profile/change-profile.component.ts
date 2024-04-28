import { ACCOUNT_IMAGE_DIRECTORY } from './../../../@core/utils/image-storing-directory';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Account } from '../../../@core/models/account/account.model';
import { AuthenticationService } from '../../../@core/services/account/authentication.service';
import { AccountService } from '../../../@core/services/account/account.service';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastState, UtilsService } from '../../../@core/services/utils.service';
import { CustomValidator } from '../../../@core/validators/custom-validator';
import { error } from 'console';

@Component({
  selector: 'ngx-change-profile',
  templateUrl: './change-profile.component.html',
  styleUrls: ['./change-profile.component.scss']
})
export class ChangeProfileComponent implements OnInit {
  public account: any;
  public refreshing: boolean;
  public fileName: string;
  public profileImage: File;
  public fileStatus = new FileUploadStatus();
  private subscriptions: Subscription[] = [];

  isFormChanged: boolean = false;
  changeProfileFormGroup: FormGroup

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private accountService: AccountService,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.changeProfileFormGroup = this.formBuilder.group({
      username: [],
      email: [],
      fullName: [, [Validators.maxLength(255), Validators.minLength(3), CustomValidator.notBlank]]
    })
    this.changeProfileFormGroup.get('username').disable()
    this.changeProfileFormGroup.get('email').disable()

    this.account = this.authService.getAccountFromLocalCache()
    this.account.image = this.account.image != null ? ACCOUNT_IMAGE_DIRECTORY + this.account.image.imageUrl : 'assets/images/no-image.jpg'
    this.fillFormValue()

    this.changeProfileFormGroup.get('fullName').valueChanges.subscribe((data) => {
      if(data != this.account.fullName || this.changeProfileFormGroup.get('fullName').valid) {
        this.isFormChanged = true
      }
    })
  }

  fillFormValue() {
    this.changeProfileFormGroup.get('username').setValue(this.account.username)
    this.changeProfileFormGroup.get('email').setValue(this.account.email)
    this.changeProfileFormGroup.get('fullName').setValue(this.account.fullName)
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId).click();
  }

  public onProfileImageChange(fileName: string, profileImage: File): void {
    this.fileName =  fileName;
    this.profileImage = profileImage;
  }

  updateFullname() {
    if(this.changeProfileFormGroup.invalid) {
      this.changeProfileFormGroup.markAllAsTouched()
      return
    }

    this.subscriptions.push(
      this.accountService.updateFullname(this.account.username, this.changeProfileFormGroup.get('fullName').value).subscribe(
        (response) => {
          if(response) {
            this.accountService.findById(this.account.id).subscribe(data => {
              this.account = data
              this.authService.addAccountToLocalCache(data)
              this.accountService.notifyAccountChange() 
              this.account.image = this.account.image != null ? ACCOUNT_IMAGE_DIRECTORY + this.account.image.imageUrl : 'assets/images/no-image.jpg'
              
              this.utilsService.updateToastState(new ToastState(`Updated account information successfully`, 'success'));
              this.fileStatus.status = 'done';
            })
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          
        }
      )
    );
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.account.username);
    formData.append('profileImage', this.profileImage);
    this.subscriptions.push(
      this.accountService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.utilsService.updateToastState(new ToastState(errorResponse.error.message, 'danger'));
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          this.subscriptions.push(
            this.accountService.findById(this.account.id).subscribe(data => {
              this.account = data
              this.authService.addAccountToLocalCache(data)
              this.accountService.notifyAccountChange() 
              this.account.image = `${ACCOUNT_IMAGE_DIRECTORY}${this.account.image.imageUrl}`;
              
              this.utilsService.updateToastState(new ToastState(`${this.account.fullName}\'s profile image updated successfully`, 'success'));
              this.fileStatus.status = 'done';
            }))
          break;
        } else {
          this.utilsService.updateToastState(new ToastState(`Unable to upload image`, 'danger'));
          break;
        }
      default:
        `Finished all processes`;
    }
  }
}

export class FileUploadStatus {
  public status: string;
  public  percentage: number;

  constructor() {
    this.status = '';
    this.percentage = 0;
  }
}

