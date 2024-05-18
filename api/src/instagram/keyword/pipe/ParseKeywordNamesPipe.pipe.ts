import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseKeywordNamesPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any {
        if (typeof value.name !== 'string') {
            throw new BadRequestException('name must be a string');
        }

        // Split the name string by commas and trim each element
        value.name = value.name.split(',').map((name: string) => name.trim());

        return value;
    }
}
