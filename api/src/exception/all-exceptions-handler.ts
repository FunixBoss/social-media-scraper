import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch(Error)
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        console.log(exception);
        
        if (exception.message.includes('Target closed')) {
            // Specific handling for TargetCloseError-like behavior
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: 'The target was closed unexpectedly: ' + exception.message,
            });
        } else if (exception instanceof HttpException) {
            // Handling for standard HTTP exceptions
            response.status(exception.getStatus()).json({
                statusCode: exception.getStatus(),
                timestamp: new Date().toISOString(),
                path: request.url,
                message: exception.getResponse(),
            });
        } else {
            // General error handling
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: 'Internal server error',
            });
        }
    }
}
