import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ImagesCarouselComponent } from '../../images-carousel.component';
import { ProductReview } from '../../../../@core/models/product/product-review.model';
import { ACCOUNT_IMAGE_DIRECTORY } from '../../../../@core/utils/image-storing-directory';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductCareGuide } from '../../../../@core/models/product/product-care-guide.model';

@Component({
  selector: 'ngx-product-detail-care-guide',
  templateUrl: './product-detail-care-guide.component.html',
})
export class ProductDetailCareGuideComponent implements OnChanges {
  @ViewChild(ImagesCarouselComponent) carousel: ImagesCarouselComponent;

  @Input() careGuide
  isCareGuideAvailable = false;
  constructor( ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.careGuide && this.careGuide) {
      this.isCareGuideAvailable = true;
      this.careGuide = Object.entries(this.careGuide)
        .filter(([key, value]) => key !== 'productId' && (value !== '' || value === null))
        .map(([key, value]) => ({ key, value }));
      console.log(this.careGuide);
        
    } else {
      this.isCareGuideAvailable = false;
    }
  }
}
