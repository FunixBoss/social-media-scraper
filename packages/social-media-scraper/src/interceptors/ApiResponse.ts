export class ApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;
    handlerTime: number;

    constructor(data: T, message = 'Success', statusCode = 200, handlerTime = 0) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.handlerTime = handlerTime;
    }
}
