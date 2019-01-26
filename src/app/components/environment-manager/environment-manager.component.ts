import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import * as fromEnvironments from '../../reducers/environments';

@Component({
  selector: 'app-environment-manager',
  templateUrl: './environment-manager.component.html',
  styleUrls: ['./environment-manager.component.scss']
})
export class EnvironmentManagerComponent implements OnInit {

  @Input() environments: fromEnvironments.State;
  @Input() showEnvironmentManager = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() baseEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentJsonChange = new EventEmitter();
  @Output() subEnvironmentTitleChange = new EventEmitter();
  @Output() addSubEnvironmentChange = new EventEmitter();
  @Output() deleteSubEnvironmentChange = new EventEmitter();

  @ViewChild('subEnvironmentTitle') subEnvironmentTitleEl: ElementRef;

  jsonEditorConfig = {
    mode: 'javascript',
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
  selectedEnvironment: fromEnvironments.EnvironmentState = null;
  editorContent = '{xxx}';
  editorTitle = '';

  constructor() { }

  ngOnInit() {
    if (this.environments) {
      this.selectEnvironment(this.environments.activeSubEnvironment || 'base');
    }
  }

  onEditorChange(content) {
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

  onTitleChange(content) {
    this.subEnvironmentTitleChange.next({ id: this.selectedEnvironmentId, value: content });
  }

  selectEnvironment(id) {
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

}
