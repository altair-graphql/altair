import {
  Component,
  OnInit,
  Input,
  SecurityContext,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { IconName } from '../icons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class IconComponent implements OnInit {
  @Input() name: IconName = 'box';
  readonly size = input('');
  @Input() svg: SafeHtml = '';

  styles = {};

  ngOnInit() {
    const size = this.size();
    if (size) {
      this.styles = {
        width: size,
        height: size,
      };
    }
  }
}
