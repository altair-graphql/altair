import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import isElectron from './app/utils/is_electron';
import { handleExternalLinks } from 'app/utils/events';
import { debug } from 'app/utils/logger';

if (environment.production) {
  enableProdMode();
}

if (isElectron) {
  const electron = window['require']('electron');
  debug.log('In electron app.');
  // Register the altair URL scheme in the electron app
  electron.webFrame.registerURLSchemeAsPrivileged('altair');
};

platformBrowserDynamic().bootstrapModule(AppModule, {
  preserveWhitespaces: true
});

handleExternalLinks();
