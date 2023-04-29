import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styles: [
  ]
})
export class TagComponent {
  @Input() label = ''
}
