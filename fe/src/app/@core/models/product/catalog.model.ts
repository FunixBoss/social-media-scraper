import { Image } from "../Image";
import { Paging } from "../response-page";

export class Catalog {
    catalogId: number;
    catalogName: string;
    image: Image;
    priceRange?: string;
    description?: string;
    childCatalogs?: Catalog[]
    parentCatalog?: Catalog
    hasParent?: boolean
    
}

export class GetCatalogResponse {
    _embedded: {
        catalogs: Catalog[]
    }
    page: Paging
}