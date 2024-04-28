import { Image } from "../Image";
import { Paging } from "../response-page";

export class PlantingDifficultyLevel {
    plantingDifficultyLevelId: number
    level: string    
}

export class GetPlantDifficultyLevelResponse {
    _embedded: {
        plantingDifficultyLevels: PlantingDifficultyLevel[]
    }
    page: Paging
}