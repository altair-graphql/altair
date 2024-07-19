import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Banner } from '../../services/banner/banner.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styles: ``,
})
export class BannerComponent {
  @Input() banner?: Banner;
  @Output() dismiss = new EventEmitter<string>();

  onDismiss() {
    this.dismiss.emit(this.banner?.id);
  }
}
