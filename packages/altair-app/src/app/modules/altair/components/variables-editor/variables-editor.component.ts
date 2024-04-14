import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';

import { IDictionary } from '../../interfaces/shared';
import { gqlVariables } from './extensions';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { TODO } from 'altair-graphql-core/build/types/shared';
import { updateSchema } from 'codemirror-json-schema';
import { vttToJsonSchema } from './utils';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_"']$/;
export const VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME = 'app-variables-editor';

@Component({
  selector: VARIABLE_EDITOR_COMPONENT_ELEMENT_NAME,
  templateUrl: './variables-editor.component.html',
  styleUrls: ['./variables-editor.component.scss'],
})
export class VariablesEditorComponent implements AfterViewInit, OnChanges {
  @Input() variables = '';
  @Input() variableToType: IDictionary = {};
  @Input() tabSize = 4;
  @Input() showVariableDialog = false;
  @Input() enableExperimental = false;

  @Output() variablesChange = new EventEmitter();

  @ViewChild('editor') editor: CodemirrorComponent | undefined;

  editorExtensions = [gqlVariables()];

  ngAfterViewInit() {
    if (this.editor?.view && this.variableToType) {
      updateSchema(this.editor.view, vttToJsonSchema(this.variableToType));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.variableToType?.currentValue) {
      this.updateVariablesToType(changes.variableToType.currentValue);
    }
  }

  updateVariablesToType(variableToType: IDictionary) {
    if (variableToType && this.editor?.view) {
      updateSchema(this.editor.view, vttToJsonSchema(variableToType));
    }
  }
}
