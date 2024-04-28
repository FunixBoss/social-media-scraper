import { AdministrativeUnits } from "./administrative-units.model";
import { Province } from "./provinces.model";

export class District {
    code: string;
    name: string;
    nameEn: string;
    fullName: string;
    fullNameEn: string;
    codeName: string;
    province?: Province;
    administrativeUnit?: AdministrativeUnits
}

export interface GetDistrictResponse {
    _embedded: {
        districts: District[]
    }
}