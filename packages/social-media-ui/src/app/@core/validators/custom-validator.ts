import { FormControl, ValidationErrors } from "@angular/forms";
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

}
