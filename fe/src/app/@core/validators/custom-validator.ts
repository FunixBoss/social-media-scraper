import { AccountService } from './../services/account/account.service';
import { AbstractControl, FormControl, ValidationErrors } from "@angular/forms";
import { catchError, map } from 'rxjs/operators'
import { Observable, of } from 'rxjs';
import { ProductService } from '../services/product/product.service';
import { ProductCouponService } from '../services/product/product-coupon.service';
export class CustomValidator {

    static notBlank(control: FormControl): ValidationErrors | null {
        if (control.value == null) {
            return { 'notblank': true };
        }
        if (typeof control.value === 'string') {
            if (control.value != null && control.value.trim().length === 0) {
                return { 'notblank': true };
            }
        } else if (typeof control.value === 'number') {
            if (control.value === null || Number.isNaN(control.value)) {
                return { 'notblank': true };
            }
        }
        return null;
    }

    static maxCouponValue(control: AbstractControl): ValidationErrors | null {
        const discountTypeControl = control.parent?.get('discountType');
        const discountValue = control.value;

        if (discountTypeControl?.value === 'Percent' && discountValue > 100) {
            return { max: true };
        }
        return null;
    }
}

export function isUsernameExisting(accountService: AccountService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return accountService.isUsernameExists(control.value).pipe(
            map((exists: boolean) => (exists ? { usernameExists: true } : null)),
            catchError(() => of(null))
        );
    };
}


export function isEmailExisting(accountService: AccountService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return accountService.isEmailExists(control.value).pipe(
            map((exists: boolean) => (exists ? { emailExists: true } : null)),
            catchError(() => of(null))
        );
    };
}

export function isEmailNotExisting(accountService: AccountService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        // Use the AccountService to check if the email exists
        return accountService.isEmailExists(control.value).pipe(
            map((exists: boolean) => (!exists ? { emailNotExists: true } : null)),
            catchError(() => of(null))
        );
    };
}

export function isCouponNotExisting(couponService: ProductCouponService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if(control.value.trim().length > 0) {
            return couponService.isCouponExists(control.value).pipe(
                map((exists: boolean) => !exists ? { couponNotExist: true } : null),
                catchError(() => of(null))
            );
        }
    };
}

export function isCouponCantBeUsed(couponService: ProductCouponService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return couponService.isCouponCanBeUsed(control.value).pipe(
            map((canUse: boolean) => !canUse ? { couponCantUse: true } : null),
            catchError(() => of(null))
        );
    };
}


export function isProductNotExisting(productService: ProductService) {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        let productName = control.value
        return productService.findByNameKeyword(productName).pipe(
            map((products: any[]) => products.length == 0 ? { productNotExist: true } : null),
            catchError(() => of(null))
        )
    };
}