import { IsIn } from "class-validator";

export class GetExportTypeDTO {
    @IsIn(["excel", "json"])
    type: "excel" | "json";
}