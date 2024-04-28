import { AdministrativeUnits } from "./administrative-units.model";

export class Province {
    code: string;
    name: string;
    nameEn: string;
    fullName: string;
    fullNameEn: string;
    codeName: string;
    administrativeUnit: AdministrativeUnits
}

export interface GetProvinceResponse {
    _embedded: {
        provinces: Province[]
    }
}