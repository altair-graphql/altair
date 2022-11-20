import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'collectionTransform',
})
export class CollectionTransformPipe implements PipeTransform {
  transform(
    list: any[],
    transformer: (list: any[], ...args: any[]) => any[],
    ...args: any[]
  ) {
    return transformer([...list], ...args);
  }
}
