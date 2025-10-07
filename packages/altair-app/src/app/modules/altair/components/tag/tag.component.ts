import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TagComponent {
  @Input() label = '';
}
