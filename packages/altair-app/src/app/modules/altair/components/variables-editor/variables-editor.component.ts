import {
  Component,
  Output,
  ViewChild,
  EventEmitter,
  AfterViewInit,
  ChangeDetectionStrategy,
  input,
  effect,
} from '@angular/core';

import { IDictionary } from '../../interfaces/shared';
import { gqlVariables } from './extensions';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { updateSchema } from 'codemirror-json-schema';
import { vttToJsonSchema } from './utils';

export const VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME = 'app-variables-editor';

@Component({
  selector: VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME,
  templateUrl: './variables-editor.component.html',
  styleUrls: ['./variables-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class VariablesEditorComponent implements AfterViewInit {
  readonly variables = input('');
  readonly variableToType = input<IDictionary>({});
  readonly tabSize = input(4);
  readonly showVariableDialog = input(false);
  readonly enableExperimental = input(false);

  @Output() variablesChange = new EventEmitter<string>();

  // eslint-disable-next-line @angular-eslint/prefer-signals
  @ViewChild('editor') editor: CodemirrorComponent | undefined;

  editorExtensions = [gqlVariables()];

  constructor() {
    effect(() => {
      this.updateVariablesToType(this.variableToType());
    });
  }

  ngAfterViewInit() {
    const variableToType = this.variableToType();
    if (this.editor?.view && variableToType) {
      updateSchema(this.editor.view, vttToJsonSchema(variableToType));
    }
  }

  updateVariablesToType(variableToType: IDictionary) {
    if (variableToType && this.editor?.view) {
      updateSchema(this.editor.view, vttToJsonSchema(variableToType));
    }
  }
}
