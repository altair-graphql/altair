import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  Output,
} from '@angular/core';
import { Banner } from '../../services/banner/banner.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BannerComponent {
  readonly banner = input<Banner>();
  @Output() dismiss = new EventEmitter<string>();

  onDismiss() {
    this.dismiss.emit(this.banner()?.id);
  }
}
