import { Component } from '@angular/core';
import { AltairModule } from './modules/altair/altair.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
  standalone: true,
  imports: [AltairModule],
})
export class AppComponent {
  constructor() {}
}
