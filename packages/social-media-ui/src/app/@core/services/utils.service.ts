import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export class ToastState {
    constructor(
        public message: string,
        public status: string,
    ) {}
    
}

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    private toastStateSubject: BehaviorSubject<ToastState> = new BehaviorSubject<ToastState>(null);
    toastState$: Observable<ToastState> = this.toastStateSubject.asObservable();

    updateToastState(toastState: ToastState): void {
        this.toastStateSubject.next(toastState);
    }

    constructor(
    ) { }

    capitalizeString(str: string): string {
        if (str == null || str.length === 0) {
          return str; // Return empty or null strings as is
        }
        
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    parseStringToDate(dateString: string): Date {
        const dateParts = dateString.split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Months are zero-based (0 - January, 1 - February, etc.)
        const year = parseInt(dateParts[2], 10);
      
        return new Date(year, month, day);
      }

    getImageFromBase64(image: string) {
        return "data:image/png;base64," + image;
    }
}
