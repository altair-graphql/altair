import { Pipe, PipeTransform } from '@angular/core';
import { mapToKeyValueList } from '../../utils';

@Pipe({
  name: 'keys',
})
export class KeysPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return mapToKeyValueList(value);
  }
}
