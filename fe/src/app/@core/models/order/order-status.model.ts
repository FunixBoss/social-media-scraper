export class OrderStatus {
    orderStatusId: number;
    statusName: string;
    description: string;
}

export class GetOrderStatusResponse {
    _embedded: {
        orderStatuses: OrderStatus[]
    }
}