import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';

import { debug } from '../../utils/logger';

// Import the codemirror packages
import * as Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/indent-fold';
// import 'codemirror/addon/display/autorefresh';
import {
  registerSettingsLinter,
  getHint,
  validateSettings,
} from '../../utils/settings_addons';
import {
  NotifyService,
  KeybinderService,
  StorageService,
} from '../../services';
import { KeyboardShortcutCategory } from '../../services/keybinder/keybinder.service';
import { SettingsState } from 'altair-graphql-core/build/types/state/settings.interfaces';
import { AltairConfig } from 'altair-graphql-core/build/config';
import { Extension } from '@codemirror/state';
import settingsSchema from '../../utils/settings.schema.json';
import { getEditorExtensions } from './extensions';
import { IDictionary, TODO } from 'altair-graphql-core/build/types/shared';

registerSettingsLinter(Codemirror);

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss'],
})
export class SettingsDialogComponent implements OnInit, OnChanges {
  @Input() settings?: SettingsState;
  @Input() appVersion = '';
  @Input() showSettingsDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() settingsJsonChange = new EventEmitter();

  themes = this.altairConfig.themes;
  languages = Object.entries(this.altairConfig.languages);
  shortcutCategories: KeyboardShortcutCategory[] = [];
  settingsSchema = settingsSchema;
  showForm = true;

  jsonSettings = '';
  localSettings = null;

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
      'Ctrl-Space': (cm: CodeMirror.Editor) => {
        this.showHint(cm);
      },
    },
  };

  editorExtensions: Extension[] = getEditorExtensions();

  constructor(
    private notifyService: NotifyService,
    private keybinderService: KeybinderService,
    private storageService: StorageService,
    private altairConfig: AltairConfig
  ) {}

  ngOnInit() {
    this.shortcutCategories = this.keybinderService.getShortcuts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.settings?.currentValue) {
      this.updateLocalSettings(
        JSON.stringify(changes.settings.currentValue, null, 2)
      );
    }
  }

  showHint(cm: TODO) {
    cm.showHint({ hint: getHint, completeSingle: false });
  }

  onSettingsChange(settingsStr: string) {
    this.updateLocalSettings(settingsStr);
  }

  saveSettings() {
    if (validateSettings(this.jsonSettings)) {
      this.settingsJsonChange.next(this.jsonSettings);
      this.toggleDialogChange.next(false);
    } else {
      this.notifyService.error('Check that the settings are correct.');
    }
  }

  onFormDataChange(data: IDictionary) {
    debug.log(data);
    this.onSettingsChange(JSON.stringify(data, null, 2));
  }

  updateLocalSettings(settingsStr: string) {
    this.jsonSettings = settingsStr;
    try {
      this.localSettings = JSON.parse(this.jsonSettings);
    } catch (error) {}
  }

  onToggleView() {
    this.showForm = !this.showForm;
  }

  onResetApplicationData(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (
      confirm(
        `
    ❌❌❌
    Warning! You are about to reset the application.
    Are you sure you want to reset the application?

    This is not reversible!`
          .trim()
          .replace(/ +/g, ' ')
      )
    ) {
      if (
        confirm(
          `
        THIS IS YOUR LAST WARNING!
        TURN BACK NOW IF YOU DON'T WANT TO LOSE ALL THE APPLICATION DATA.

        ARE YOU REALLY SURE YOU WANT TO RESET ALTAIR?!
      `
            .trim()
            .replace(/ +/g, ' ')
        )
      ) {
        this.storageService.clearAllLocalData();
        location.reload();
      }
    }

    return false;
  }

  trackByIndex(index: number) {
    return index;
  }
}
