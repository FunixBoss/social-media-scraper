import { environment } from '../../../environments/environment';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class BaseURLService {
    private _baseURL: string = `${environment.apiUrl}/api/admin`

    get baseURL(): string{
        return this._baseURL ;
    }
}