import { environment } from '../../../environments/environment';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class BaseURLService {
    private _baseURL: string = `${environment.apiUrl}/api/admin`
    private _insURL: string = `${environment.insUrl}/api/ins`
    get baseURL(): string{
        return this._baseURL ;
    }
    get insURL(): string{
        return this._insURL ;
    }
}