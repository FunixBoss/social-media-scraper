import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from './ApiResponse';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        return next.handle().pipe(
            map(data => {
                const handlerTime = Date.now() - start;
                if (data instanceof ApiResponse) {
                    return {
                        ...data,
                        handlerTime,
                    };
                } else {
                    return new ApiResponse(data, 'Success', 200, handlerTime);
                }
            }),
        );
    }
}
