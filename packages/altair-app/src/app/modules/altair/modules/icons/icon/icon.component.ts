import {
  Component,
  OnInit,
  Input,
  SecurityContext,
  ChangeDetectionStrategy,
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
  @Input() size = '';
  @Input() svg: SafeHtml = '';

  styles = {};

  ngOnInit() {
    if (this.size) {
      this.styles = {
        width: this.size,
        height: this.size,
      };
    }
  }
}
