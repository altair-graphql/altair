import { Component, OnInit, ChangeDetectionStrategy, input } from '@angular/core';
import { IconName } from '../icons';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class IconComponent implements OnInit {
  readonly name = input<IconName>('box');
  readonly size = input('');
  readonly svg = input<SafeHtml>('');

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
