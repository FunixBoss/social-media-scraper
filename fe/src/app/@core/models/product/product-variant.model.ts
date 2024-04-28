import { Image } from "../Image";
import { ProductSize } from "./product-size.model";

export class ProductVariant {
    productVariantId: number;
    productSize: ProductSize;
    quantity: number;
    price: number;
    image?: Image;
    imageUrl?: string;
    height?: number;
    width?: number;
}