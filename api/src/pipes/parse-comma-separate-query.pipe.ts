import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseCommaSeparatedQuery implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): string[] {
        return value.split(',').map(v => v.trim());
    }
}