import { Paging } from '../response-page';
import { CouponType } from "./coupon-type.model";

export class Coupon {
    couponId: number;
    code: string;
    discount: number;
    couponType: CouponType
    description: string;
    startedAt: Date;
    expiredAt: Date;
}

export class GetCouponResponse {
    _embedded: {
        coupons: Coupon[]
    }
    page: Paging
}