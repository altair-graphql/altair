import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, SimpleChanges, OnChanges } from '@angular/core';

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
import { registerSettingsLinter, getHint, validateSettings } from 'app/utils/settings_addons';
import { NotifyService, KeybinderService, StorageService } from 'app/services';

registerSettingsLinter(Codemirror);

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit, AfterViewInit, OnChanges {

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
  shortcutCategories = [];

  @ViewChild('editor') editor;
  jsonSettings = '';

  jsonEditorConfig = {
    mode: 'application/json',
    // json: true,
    lint: true,
    lineWrapping: true,
    foldGutter: true,
    autoRefresh: true,
    dragDrop: false,
    autoCloseBrackets: true,
    theme: 'default settings-editor',
    gutters: ['CodeMirror-lint-markers'],
    extraKeys: {
      'Ctrl-Space': (cm) => { this.showHint(cm); },
    }
  };

  constructor(
    private notifyService: NotifyService,
    private keybinderService: KeybinderService,
    private storageService: StorageService,
  ) {}

  ngOnInit() {
    this.shortcutCategories = this.keybinderService.getShortcuts();
  }

  ngAfterViewInit() {
    if (this.editor) {
      this.editor.codeMirror.on('keyup', (cm, event) => /^[a-zA-Z0-9_@(]$/.test(event.key) && this.showHint(cm));
      this.editor.codeMirror.refresh();
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    // Refresh the query result editor view when there are any changes
    // to fix any broken UI issues in it
    if (this.editor.codeMirror) {
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
    if (validateSettings(this.jsonSettings)) {
      this.settingsJsonChange.next(this.jsonSettings);
      this.toggleDialogChange.next(false);
    } else {
      this.notifyService.error('Check that the settings are correct.');
    }
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

  onResetApplicationData(e) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`
    ❌❌❌
    Warning! You are about to reset the application.
    Are you sure you want to reset the application?

    This is not reversible!`.trim().replace(/ +/g, ' '))) {
      if (confirm(`
        THIS IS YOUR LAST WARNING!
        TURN BACK NOW IF YOU DON'T WANT TO LOSE ALL THE APPLICATION DATA.

        ARE YOU REALLY SURE YOU WANT TO RESET ALTAIR?!
      `.trim().replace(/ +/g, ' '))) {
        this.storageService.clearAllLocalData();
      }
    }

    return false;
  }

}
