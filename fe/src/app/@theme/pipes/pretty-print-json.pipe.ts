import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyPrintJSONPipe'
})
export class PrettyPrintJSONPipe implements PipeTransform {

  transform(val) {
    return JSON.stringify(val, null, 2)
  }

}
