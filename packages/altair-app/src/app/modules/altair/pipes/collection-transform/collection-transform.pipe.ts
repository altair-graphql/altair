import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'collectionTransform',
})
export class CollectionTransformPipe implements PipeTransform {
  transform<I = unknown, R = unknown>(
    list: I[],
    transformer: (list: I[], ...args: unknown[]) => R[],
    ...args: unknown[]
  ) {
    return transformer([...list], ...args);
  }
}
