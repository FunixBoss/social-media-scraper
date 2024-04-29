import { Component, Input, OnChanges, SimpleChanges, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Product } from '../../../../@core/models/product/product.model';
import { ImagesCarouselComponent } from '../../images-carousel.component';

@Component({
  selector: 'ngx-product-detail-basic',
  templateUrl: './product-detail-basic.component.html',
  styleUrls: ['./product-detail-basic.component.scss']
})
export class ProductDetailBasicComponent implements OnChanges, AfterViewInit{
  @ViewChild(ImagesCarouselComponent) carousel: ImagesCarouselComponent;
  @Input() product: Product
  isProductAvailable = false;
  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.product && this.product) {
      this.isProductAvailable = true;
    } else {
      this.isProductAvailable = false;
    }
  }

  ngAfterViewInit() {
    this.carousel.show(this.product.imageUrls)
  }
}
