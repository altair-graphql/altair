import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

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
  readonly toggleVariableDialog = output<boolean>();
  readonly variablesChange = output<string>();

  trackByFn<T>(index: number, item: T) {
    return index;
  }
}
