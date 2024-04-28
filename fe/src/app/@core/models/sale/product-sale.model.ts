import { Paging } from '../response-page';
import { ProductSaleType } from './product-sale-type.model';

export class ProductSale {
    productSaleId: number;
    saleName: string;
    discount: number;
    productSaleType: ProductSaleType
    description: string;
    active: boolean;
    startedAt: Date;
    expiredAt: Date;
}

export class GetProductSaleResponse {
    _embedded: {
        productSales: ProductSale[]
    }
    page: Paging
}