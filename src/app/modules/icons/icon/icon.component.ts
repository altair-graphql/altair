import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styles: []
})
export class IconComponent implements OnInit {

  @Input() name = '';
  @Input() size = '';

  styles = {};
  constructor() { }

  ngOnInit() {
    if (this.size) {
      this.styles = {
        width: this.size,
        height: this.size,
      };
    }
  }

}
