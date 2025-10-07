import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'collectionTransform',
  standalone: false,
})
export class CollectionTransformPipe implements PipeTransform {
  transform<I = unknown, A extends unknown[] = unknown[], R = unknown>(
    list: I[],
    transformer: (list: I[], ...args: A) => R[],
    ...args: A
  ) {
    return transformer([...list], ...args);
  }
}
