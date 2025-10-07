import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  standalone: false,
})
export class SortPipe implements PipeTransform {
  transform(list: Record<string, string>[], key?: string) {
    if (!Array.isArray(list)) {
      return list;
    }

    // don't sort array in place
    list = list.concat();

    if (!key) {
      return list.sort();
    }

    return list.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue !== 'string' || typeof bValue !== 'string') {
        return 0;
      }

      return aValue.toLowerCase() > bValue.toLowerCase() ? 1 : -1;
    });
  }
}
