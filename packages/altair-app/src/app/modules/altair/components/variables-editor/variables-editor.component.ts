import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  OnChanges,
  ElementRef,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import 'codemirror/addon/display/autorefresh';
import 'codemirror/keymap/sublime';
import 'codemirror/mode/javascript/javascript';
import 'codemirror-graphql/variables/hint';
import 'codemirror-graphql/variables/lint';
import 'codemirror-graphql/variables/mode';
import { handleEditorRefresh } from '../../utils/codemirror/refresh-editor';
import { IDictionary } from '../../interfaces/shared';
import { gqlVariables, updateVariableToType } from './extensions';
import { CodemirrorComponent } from '../codemirror/codemirror.component';
import { TODO } from 'altair-graphql-core/build/types/shared';

const AUTOCOMPLETE_CHARS = /^[a-zA-Z0-9_\"\']$/;

@Component({
  selector: 'app-variables-editor',
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

  @ViewChild('editor', { static: true }) editor?: ElementRef & {
    codeMirror: CodeMirror.Editor;
  };

  @ViewChild('newEditor') newEditor: CodemirrorComponent | undefined;

  variableEditorConfig = <any>{
    mode: 'graphql-variables',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    tabSize: this.tabSize,
    indentUnit: this.tabSize,
    matchBrackets: true,
    autoCloseBrackets: true,
    keyMap: 'sublime',
    extraKeys: {
      'Ctrl-Enter': (_cm: CodeMirror.Editor) => {},
      'Cmd-Enter': (_cm: CodeMirror.Editor) => {},
      'Cmd-Space': (cm: TODO) => cm.showHint({ completeSingle: false }),
      'Ctrl-Space': (cm: TODO) => cm.showHint({ completeSingle: false }),
      'Alt-Space': (cm: TODO) => cm.showHint({ completeSingle: false }),
    },
    theme: 'default variable-editor mousetrap',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    lint: {},
    hintOptions: {
      completeSingle: false,
    },
  };

  editorExtensions = [gqlVariables()];

  ngAfterViewInit() {
    if (this.editor?.codeMirror) {
      (this.editor.codeMirror as any).on(
        'keyup',
        (cm: CodeMirror.Editor, event: KeyboardEvent) => this.onKeyUp(cm, event)
      );
    }

    if (this.newEditor?.view && this.variableToType) {
      updateVariableToType(this.newEditor.view, this.variableToType);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    handleEditorRefresh(this.editor?.codeMirror);
    if (changes?.variableToType?.currentValue) {
      this.updateVariablesToType(changes.variableToType.currentValue);
    }

    if (changes?.tabSize?.currentValue) {
      this.variableEditorConfig.tabSize = this.tabSize;
      this.variableEditorConfig.indentUnit = this.tabSize;
    }

    if (
      changes?.activeWindowId?.currentValue ||
      changes?.showVariableDialog?.currentValue
    ) {
      handleEditorRefresh(this.editor?.codeMirror);
    }
  }

  onKeyUp(cm: CodeMirror.Editor, event: KeyboardEvent) {
    if (AUTOCOMPLETE_CHARS.test(event.key)) {
      if (this.editor) {
        this.editor.codeMirror.execCommand('autocomplete');
      }
    }
  }

  updateVariablesToType(variableToType: IDictionary) {
    if (variableToType) {
      this.variableEditorConfig.lint.variableToType = variableToType;
      this.variableEditorConfig.hintOptions.variableToType = variableToType;
      if (this.newEditor?.view) {
        updateVariableToType(this.newEditor.view, variableToType);
      }
    }
  }
}
