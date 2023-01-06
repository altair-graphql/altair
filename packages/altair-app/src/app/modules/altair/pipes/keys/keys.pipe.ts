import { Pipe, PipeTransform } from '@angular/core';
import { IDictionary } from 'altair-graphql-core/build/types/shared';
import { mapToKeyValueList } from '../../utils';

@Pipe({
  name: 'keys',
})
export class KeysPipe implements PipeTransform {
  transform(value: IDictionary<string>) {
    return mapToKeyValueList(value);
  }
}
