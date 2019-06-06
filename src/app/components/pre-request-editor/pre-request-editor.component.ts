import {
  Component,
  OnInit,
  OnChanges,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/mode/javascript/javascript';

@Component({
  selector: 'app-pre-request-editor',
  templateUrl: './pre-request-editor.component.html',
  styles: []
})
export class PreRequestEditorComponent implements OnChanges {

  @Input() preRequest = null;
  @Output() preRequestScriptChange = new EventEmitter();
  @Output() preRequestEnabledChange = new EventEmitter();

  @ViewChild('editor') editor;

  preRequestEditorConfig = {
    mode: 'javascript',
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    autoCloseBrackets: true,
    theme: 'default pre-request-editor mousetrap',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {'Ctrl-Space': 'autocomplete'},
    hintOptions: {
      completeSingle: false,
      globalScope: Object.create(null, {
        altair: {
          value: Object.create(null, {
            helpers: {
              value: Object.create(null, {
                getEnvironment: {
                  value: null
                },
                setEnvironment: {
                  value: null
                },
              }),
            }
          })
        }
      })
    },
  };

  constructor() { }

  ngOnChanges() {
    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.codeMirror) {
      this.editor.codeMirror.refresh();
    }
  }

}
