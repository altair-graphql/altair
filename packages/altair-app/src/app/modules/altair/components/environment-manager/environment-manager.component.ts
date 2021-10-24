import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import * as fromEnvironments from '../../store/environments/environments.reducer';
import { handleEditorRefresh } from '../../utils/codemirror/refresh-editor';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/keymap/sublime';
import { EnvironmentsState, EnvironmentState } from 'altair-graphql-core/build/types/state/environments.interfaces';
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
export class EnvironmentManagerComponent implements OnInit, OnChanges {

  @Input() environments: EnvironmentsState;
  @Input() showEnvironmentManager = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() baseEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentTitleChange = new EventEmitter();
  @Output() addSubEnvironmentChange = new EventEmitter();
  @Output() deleteSubEnvironmentChange = new EventEmitter();
  @Output() repositionSubEnvironmentsChange = new EventEmitter();

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
    keyMap: 'sublime',
    theme: 'default environments-editor',
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {}
  };

  selectedEnvironmentId = 'base';
  selectedEnvironment?: EnvironmentState;
  editorContent = '{}';
  editorTitle = '';

  sortableOptions = {};

  constructor() { }

  ngOnInit() {
    if (this.environments) {
      this.selectEnvironment(this.environments.activeSubEnvironment);
    }
    this.sortableOptions = {
      onUpdate: (event: any) => {
        this.repositionSubEnvironmentsChange.emit({ currentPosition: event.oldIndex, newPosition: event.newIndex });
      }
    };
  }
  
  ngOnChanges(changes: SimpleChanges) {
    handleEditorRefresh(this.editor && this.editor.codeMirror);
    if (changes.showEnvironmentManager && changes.showEnvironmentManager.currentValue) {
      const refreshEditorTimeout = setTimeout(() => {
        handleEditorRefresh(this.editor && this.editor.codeMirror, true);
        clearTimeout(refreshEditorTimeout);
      }, 300);
    }
    if (changes.environments && changes.environments.currentValue) {
      this.selectEnvironment(this.selectedEnvironmentId);
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

  selectEnvironment(id?: string) {
    this.selectedEnvironmentId = id || 'base';

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
      this.selectEnvironment();
    }
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
