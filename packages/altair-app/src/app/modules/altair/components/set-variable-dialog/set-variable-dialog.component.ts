import {
  Component,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  ChangeDetectionStrategy,
  input
} from '@angular/core';

@Component({
  selector: 'app-set-variable-dialog',
  templateUrl: './set-variable-dialog.component.html',
  styleUrls: ['./set-variable-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SetVariableDialogComponent {
  readonly showVariableDialog = input(false);
  readonly variables = input('');
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() variablesChange = new EventEmitter();

  trackByFn<T>(index: number, item: T) {
    return index;
  }
}
