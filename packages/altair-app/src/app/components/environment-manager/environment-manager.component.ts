import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  DoCheck,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import * as fromEnvironments from '../../reducers/environments';
import { handleEditorRefresh } from 'app/utils/codemirror/refresh-editor';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
(window as any).jsonlint = (window as any).jsonlint || {
  parser: {
    parse: function(str: string) {
      try {
        return JSON.parse(str);
      } catch (err) {
        if (this.parseError) {
          this.parseError('Invalid JSON', {
            loc: {
              first_line: 1,
              first_column: 1,
              last_line: 1,
              last_column: 1,
            }
          });
        }
      }
    }
  },
};

@Component({
  selector: 'app-environment-manager',
  templateUrl: './environment-manager.component.html',
  styleUrls: ['./environment-manager.component.scss']
})
export class EnvironmentManagerComponent implements OnInit, DoCheck, OnChanges {

  @Input() environments: fromEnvironments.State;
  @Input() showEnvironmentManager = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() baseEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentTitleChange = new EventEmitter();
  @Output() addSubEnvironmentChange = new EventEmitter();
  @Output() deleteSubEnvironmentChange = new EventEmitter();

  @ViewChild('editor') editor: ElementRef & { codeMirror: CodeMirror.Editor };
  @ViewChild('subEnvironmentTitle') subEnvironmentTitleEl: ElementRef;

  jsonEditorConfig = {
    mode: 'application/json',
    json: true,
    lint: true,
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    autoCloseBrackets: true,
    theme: 'default environments-editor',
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
    }
  };

  selectedEnvironmentId = 'base';
  selectedEnvironment?: fromEnvironments.EnvironmentState;
  editorContent = '{}';
  editorTitle = '';

  constructor() { }

  ngOnInit() {
    if (this.environments) {
      this.selectEnvironment(this.environments.activeSubEnvironment || 'base');
    }
  }

  ngDoCheck() {
    handleEditorRefresh(this.editor && this.editor.codeMirror);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.showEnvironmentManager && changes.showEnvironmentManager.currentValue) {
      setTimeout(() => {
        handleEditorRefresh(this.editor && this.editor.codeMirror, true);
      }, 300);
    }
  }

  onEditorChange(content: string) {
    try {
      JSON.parse(content);

      if (this.selectedEnvironmentId === 'base') {
        this.baseEnvironmentJsonChange.next({ value: content });
      } else {
        this.subEnvironmentJsonChange.next({id: this.selectedEnvironmentId, value: content });
      }
    } catch (ex) {
      // Do nothing.
    }
  }

  onTitleChange(content: string) {
    this.subEnvironmentTitleChange.next({ id: this.selectedEnvironmentId, value: content });
  }

  selectEnvironment(id: string) {
    this.selectedEnvironmentId = id;

    if (this.selectedEnvironmentId === 'base') {
      this.selectedEnvironment = this.environments.base;
    } else {
      this.selectedEnvironment = this.environments.subEnvironments.find(env => env.id === this.selectedEnvironmentId);
    }

    if (this.selectedEnvironment) {
      this.editorContent = this.selectedEnvironment.variablesJson;
      this.editorTitle = this.selectedEnvironment.title;
    }
  }

  setFocusOnEnvironmentTitle() {
    this.subEnvironmentTitleEl.nativeElement.focus();
  }

  onDeleteSubEnvironment() {
    if (confirm('Are you sure you want to delete this environment?')) {
      this.deleteSubEnvironmentChange.next({ id: this.selectedEnvironmentId });
      this.selectEnvironment('base');
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
