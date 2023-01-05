import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-set-variable-dialog',
  templateUrl: './set-variable-dialog.component.html',
  styleUrls: ['./set-variable-dialog.component.scss'],
})
export class SetVariableDialogComponent {
  @Input() showVariableDialog = false;
  @Input() variables = '';
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() variablesChange = new EventEmitter();

  trackByFn<T>(index: number, item: T) {
    return index;
  }
}
