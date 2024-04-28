import { Cart } from "../cart/cart.model";
import { Role } from "./role.model"
import { Wishlist } from "./wishlist.model";
import { Address } from "../address/address.model";
import { Order } from "../order/order.model";
import { Image } from "../Image";
import { ProductReview } from "../product/product-review.model";

export class Account {
    id: number
    username: string;
    password?: string;   
    fullName: string;
    email: string;
    phoneNumber: string;
    role?: Role;
    image?: Image;
    active: boolean;
    createdAt: Date
    updatedAt: Date
    address?: Address[]
    cart?: Cart;
    wishlist?: Wishlist[];
    orders?: Order[]
    totalOrders?: number;
    productReviews?: ProductReview[]
}