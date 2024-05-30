import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseInfosPipe implements PipeTransform<string, string[]> {
    transform(value: any, metadata: ArgumentMetadata): string[] {        
        return {
            ...value,
            infos: value.infos.split("-")
        };
    }

}