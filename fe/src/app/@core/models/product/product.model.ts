import { Image } from "../Image";
import { ProductSale } from "../sale/product-sale.model";
import { Catalog } from "./catalog.model";
import { PlantingDifficultyLevel } from "./planting-difficulty-level.model";
import { ProductCareGuide } from "./product-care-guide.model";
import { ProductReview } from "./product-review.model";
import { ProductVariant } from "./product-variant.model";

export class Product {
    productId: number;
    productName: string;
    description: string;
    catalog?: Catalog;
    productSale?: ProductSale;
    plantingDifficultyLevel?: PlantingDifficultyLevel
    productCareGuide?: ProductCareGuide
    active: boolean;
    sale: boolean;
    top: boolean;
    new_: boolean;
    createdAt: Date;
    updatedAt: Date;
    productVariants?: ProductVariant[]
    productReviews?: ProductReview[]
    images?: Image[]
    imageSizeGuide?: Image
    imageSizeGuideUrl?: string;
    imageUrl?: string;
    imageUrls?: string[];
    totalSold?: number;
    totalLikes?: number;
    totalRating?: number;
    avgRating: number;
}