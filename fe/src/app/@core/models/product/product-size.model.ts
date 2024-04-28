import { Paging } from "../response-page";

export class ProductSize {
    productSizeId: number;
    sizeName: string;

    constructor(productSizeId: number, sizeName: string) {
        this.productSizeId = productSizeId
        this.sizeName = sizeName
    }
}

export class GetProductSizeResponse {
    _embedded: {
        productSizes: ProductSize[]
    }
    page: Paging
}