import { Pipe, PipeTransform } from '@angular/core';
import { truncateText } from '../utils';

@Pipe({
  name: 'truncate',
  standalone: false,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, length = 50, symbol = '...') {
    return truncateText(value, length, symbol);
  }
}
