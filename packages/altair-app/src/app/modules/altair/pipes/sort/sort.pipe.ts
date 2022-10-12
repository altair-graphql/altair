import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
})
export class SortPipe implements PipeTransform {
  transform(list: Record<string, string>[], key?: string): any {
    if (!Array.isArray(list)) {
      return list;
    }

    // don't sort array in place
    list = list.concat();

    if (!key) {
      return list.sort();
    }

    return list.sort((a, b) =>
      a[key].toLowerCase() > b[key].toLowerCase() ? 1 : -1
    );
  }
}
