import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-set-variable-dialog',
  templateUrl: './set-variable-dialog.component.html',
  styleUrls: ['./set-variable-dialog.component.scss']
})
export class SetVariableDialogComponent {

  @Input() showVariableDialog = false;
  @Input() variables = [];
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() addVariableChange = new EventEmitter();
  @Output() variableKeyChange = new EventEmitter();
  @Output() variableValueChange = new EventEmitter();
  @Output() removeVariableChange = new EventEmitter();

  constructor() {
    // this.store.changes
    //   .subscribe(data => {
    //     this.variables = data.variables;
    //     // this.gql.setHeaders(data.headers);
    //   });
  }

  trackByFn(index, item) {
    return index;
  }
}
