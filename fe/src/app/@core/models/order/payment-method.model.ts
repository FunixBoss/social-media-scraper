export class PaymentMethod {
    paymentMethodId: number;
    methodName: string;
}

export class GetPaymentMethodResponse {
    _embedded: {
        paymentMethods: PaymentMethod[]
    }
}