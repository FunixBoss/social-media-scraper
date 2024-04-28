import { AdministrativeUnits } from "./administrative-units.model";
import { District } from "./districts.model";

export class Ward {
    code: string;
    name: string;
    nameEn: string;
    fullName: string;
    fullNameEn: string;
    codeName: string;
    district?: District
    administrativeUnit: AdministrativeUnits
}

export interface GetWardResponse {
    _embedded: {
        wards: Ward[]
    }
}