import { Component, OnInit, Input } from '@angular/core';
import { IconName } from '../icons';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styles: [],
})
export class IconComponent implements OnInit {
  @Input() name: IconName = 'box';
  @Input() size = '';

  styles = {};
  constructor() {}

  ngOnInit() {
    if (this.size) {
      this.styles = {
        width: this.size,
        height: this.size,
      };
    }
  }
}
