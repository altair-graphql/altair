import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import * as fromSettings from '../../reducers/settings/settings';

import config from '../../config';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {

  @Input() settings: fromSettings.State;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() themeChange = new EventEmitter();
  @Output() languageChange = new EventEmitter();
  @Output() addQueryDepthLimitChange = new EventEmitter();

  themes = config.themes;
  languages = Object.entries(config.languages);

  constructor() {}

  ngOnInit() {
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

}
