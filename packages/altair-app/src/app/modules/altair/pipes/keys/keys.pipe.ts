import { Pipe, PipeTransform } from '@angular/core';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { mapToKeyValueList } from '../../utils';

@Pipe({
  name: 'keys',
  standalone: false,
})
export class KeysPipe implements PipeTransform {
  transform(value: IDictionary<string>) {
    return mapToKeyValueList(value);
  }
}
