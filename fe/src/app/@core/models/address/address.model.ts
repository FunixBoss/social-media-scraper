import { District } from "./districts.model";
import { Province } from "./provinces.model";
import { Ward } from "./wards.model";

export class Address {
    addressId: number;
    roadName: string;
    ward?: Ward
    district?: District
    province?: Province
}

export class GetAddressResponse { 
    _embedded: {
        addresses: Address[]
    }
}