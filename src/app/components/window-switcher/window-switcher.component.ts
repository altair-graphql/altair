import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-window-switcher',
  templateUrl: './window-switcher.component.html',
  styleUrls: ['./window-switcher.component.scss']
})
export class WindowSwitcherComponent implements OnInit {

  @Input() windows = [];
  @Input() activeWindowId = '';
  @Output() activeWindowChange = new EventEmitter();
  @Output() newWindowChange = new EventEmitter();
  @Output() removeWindowChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
