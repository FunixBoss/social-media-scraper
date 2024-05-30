import { Component, QueryList, ViewChildren, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../@core/services/product/product.service';
import { NbAccordionItemComponent, NbTabComponent } from '@nebular/theme';
import { PRODUCT_IMAGE_DIRECTORY, VARIANT_IMAGE_DIRECTORY } from '../../../@core/utils/image-storing-directory';
import { ProductReviewService } from '../../../@core/services/product/product-review.service';
import { ProductReview } from '../../../@core/models/product/product-review.model';
import { Product } from '../../../@core/models/product/product.model';

@Component({
  selector: 'ngx-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  @ViewChildren(NbAccordionItemComponent) accordions: QueryList<NbAccordionItemComponent>;

  product: Product;
  loaded: boolean = false
  comments: ProductReview[];
  numberOfComments: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private productReviewService: ProductReviewService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.loaded = false;
      this.productService.findById(params['id'])
        .subscribe(data => {
          this.product = data
          this.product.imageUrls = this.product.imageUrls.map(img => PRODUCT_IMAGE_DIRECTORY + img)
          this.product.productVariants.map(variant => {
            variant.imageUrl = VARIANT_IMAGE_DIRECTORY + variant.imageUrl
          })
          this.loaded = true
          
          this.productService.countTotalComments(this.product.productId).subscribe(data => {
            if(data > 99) {
              this.numberOfComments = '99+'
            } else {
              this.numberOfComments = data + ''
            }
          })
        })
    })
  }

  changeTab(event: NbTabComponent) {
    if(event.tabTitle === "Comments" && this.comments == undefined) {
      this.productReviewService.findByProductId(this.product.productId)
        .subscribe(data => {
          this.comments = data
        })
    } 
  }
}
