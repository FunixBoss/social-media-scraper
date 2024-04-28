import { BaseURLService } from './../services/base-url.service';
import { AuthenticationService } from './../services/account/authentication.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authenticationService: AuthenticationService,
        private baseUrlService: BaseURLService,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(request.url.includes(`${this.baseUrlService.baseURL}/admin/auth/login`)) {
            return next.handle(request);
        } 
        this.authenticationService.loadToken()
        const token = this.authenticationService.getToken();

        if(token != null) {
            const requestClone = request.clone({setHeaders: { Authorization: `Bearer ${token}`}})
            return next.handle(requestClone);
        }
        
        return next.handle(request);
    }
}