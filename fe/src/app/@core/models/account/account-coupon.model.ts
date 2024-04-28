import { Coupon } from "../coupon/coupon.model";
import { Account } from "./account.model";

export class AccountCoupon {
    coupon: Coupon;
    account: Account;
    isUsed: boolean;
}