import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';

import * as fromSettings from '../../reducers/settings/settings';

import config from '../../config';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/display/autorefresh';
import { registerSettingsLinter, getHint } from 'app/utils/settings_addons';

registerSettingsLinter(Codemirror);

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit, AfterViewInit {

  @Input() settings: fromSettings.State;
  @Input() appVersion: string;
  @Input() showSettingsDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() settingsJsonChange = new EventEmitter();
  @Output() themeChange = new EventEmitter();
  @Output() languageChange = new EventEmitter();
  @Output() addQueryDepthLimitChange = new EventEmitter();
  @Output() tabSizeChange = new EventEmitter();

  themes = config.themes;
  languages = Object.entries(config.languages);

  @ViewChild('editor') editor;
  jsonSettings = '';

  jsonEditorConfig = {
    mode: 'application/json',
    // json: true,
    lint: true,
    lineWrapping: true,
    lineNumbers: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    autoCloseBrackets: true,
    theme: 'default settings-editor',
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    extraKeys: {
      'Ctrl-Space': (cm) => { this.showHint(cm); },
    }
  };

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.codeMirror.on('keyup', (cm, event) => /^[a-zA-Z0-9_@(]$/.test(event.key) && this.showHint(cm));
      this.editor.codeMirror.refresh();
    }
  }

  showHint(cm) {
    cm.showHint({ hint: getHint, completeSingle: false });
  }

  onSettingsChange(settingsStr) {
    this.jsonSettings = settingsStr;
  }

  saveSettings() {
    this.settingsJsonChange.next(this.jsonSettings);
    this.toggleDialogChange.next(false);
  }

  onSelectTheme(theme) {
    return this.themeChange.next(theme);
  }

  onSelectLanguage(language) {
    return this.languageChange.next(language);
  }

  onChangeAddQueryDepthLimit(depthLimit) {
    return this.addQueryDepthLimitChange.next(depthLimit);
  }

  onChangeTabSize(tabSize: number) {
    return this.tabSizeChange.next(tabSize);
  }

}
