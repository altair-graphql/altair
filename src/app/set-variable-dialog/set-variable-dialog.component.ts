import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { Store } from '../store';
import { StoreHelper } from '../services/store-helper';

@Component({
  selector: 'app-set-variable-dialog',
  templateUrl: './set-variable-dialog.component.html',
  styleUrls: ['./set-variable-dialog.component.scss']
})
export class SetVariableDialogComponent implements OnInit {

  @Input() showVariableDialog = false;
  @Output() toggleVariableDialog = new EventEmitter();
  variables = [];

  constructor(
    private storeHelper: StoreHelper,
    private store: Store
  ) {
    this.store.changes
      .subscribe(data => {
        this.variables = data.variables;
        // this.gql.setHeaders(data.headers);
      });
  }

  ngOnInit() {
  }


  addVariable() {
    this.variables.push({
      key: '',
      value: ''
    });
    this.storeHelper.update('variables', this.variables);
  }

  variableKeyChange($event, i) {
    const val = $event.target.value;
    this.variables[i].key = val;
    this.storeHelper.update('variables', this.variables);
  }
  variableValueChange($event, i) {
    const val = $event.target.value;
    this.variables[i].value = val;
    this.storeHelper.update('variables', this.variables);
  }

  removeVariable(i) {
    this.variables.splice(i , 1);
    this.storeHelper.update('variables', this.variables);
  }
}
