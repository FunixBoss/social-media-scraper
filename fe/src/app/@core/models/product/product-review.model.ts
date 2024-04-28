import { Account } from "../account/account.model";
import { Product } from "./product.model";

export class ProductReview {
    productReviewId: number;
    imageUrl: string;
    accountEmail: string;
    account?: Account;
    product?: Product;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt: Date;
}