import { ProductVariant } from "../product/product-variant.model";
import { Product } from "../product/product.model";
import { Cart } from "./cart.model";

export class CartDetail {
    cartId: number;
    product?: Product;
    productVariant?: ProductVariant
    cart?: Cart
    quantity: number
    price: number;
}