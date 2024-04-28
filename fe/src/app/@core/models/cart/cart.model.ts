import { Account } from "../account/account.model";

export class Cart {
    cartId: number;
    account?: Account
    createdAt: Date;
    updatedAt: Date
}