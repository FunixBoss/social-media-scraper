import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ProductReview } from '../../../../@core/models/product/product-review.model';
import { ACCOUNT_IMAGE_DIRECTORY } from '../../../../@core/utils/image-storing-directory';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-customer-detail-comments',
  templateUrl: './customer-detail-comments.component.html',
  styles: [
    `
			i {
				font-size: 2rem;
				padding-right: 0.1rem;
				color: #b0c4de;
			}
			.filled {
				color: #FFD700;
			}
			.low {
				color: #deb0b0;
			}
			.filled.low {
				color: #ff1e1e;
			}
		`,
  ],
})
export class CustomerDetailCommentsComponent implements OnChanges {
  @Input() comments: ProductReview[]
  filteredComments: ProductReview[]
  filterMode: boolean

  isCommentAvailable = false;
  searchFormGroup: FormGroup
  constructor(
    private formBuilder: FormBuilder
  ) {
    this.searchFormGroup = formBuilder.group({
      email: [''],
      sort: [null],
      filter: [null]
    })
    this.onEmailChanges()
  }

  onFilterAny(controlChangeName: string) {
    (controlChangeName != 'email') ? this.searchFormGroup.get('email').reset() : 1;
    (controlChangeName != 'sort') ? this.searchFormGroup.get('sort').reset() : 1;
    (controlChangeName != 'filter') ? this.searchFormGroup.get('filter').reset() : 1;
  }

  onEmailChanges() {
    this.searchFormGroup.get('email').valueChanges.subscribe(data => {
      this.onFilterAny('email')
      if (data == '') {
        this.filterMode = false
      } else {
        this.filterMode = true
        this.filteredComments = [...this.comments].filter(cmt => cmt.accountEmail.startsWith(data))
      }
    })
  }

  onSort(event: any) {
    this.onFilterAny('sort')
    this.searchFormGroup.get('sort').setValue(event)
    if (event == null) {
      this.filterMode = false
    } else {
      this.filterMode = true
      if (event == 'Newest') {
        this.filteredComments = [...this.comments].sort((cmt1, cmt2) =>
          (new Date(cmt1.createdAt).getTime() < new Date(cmt2.createdAt).getTime()) ? 1 : -1)
      } else if (event == 'Rating Star') {
        this.filteredComments = [...this.comments].sort((cmt1, cmt2) => {
          return (cmt2.rating > cmt1.rating) ? 1 : -1
        })
      }
    }
  }

  onFilter(event: any) {
    this.onFilterAny('filter')
    this.searchFormGroup.get('filter').setValue(event)
    if (event == null) {
      this.filterMode = false
    } else {
      this.filterMode = true
      this.filteredComments = [...this.comments].filter((cmt1) => {
        return cmt1.rating == event
      })
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.comments && this.comments) {
      this.isCommentAvailable = true;
      this.comments.map((comment: ProductReview) => {
        comment.imageUrl = ACCOUNT_IMAGE_DIRECTORY + comment.imageUrl
      })

    } else {
      this.isCommentAvailable = false;
    }
  }
}
