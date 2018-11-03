import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import isElectron from './app/utils/is_electron';
import { initTracking } from './app/utils/ga';
import { handleExternalLinks } from 'app/utils/events';

if (environment.production) {
  enableProdMode();
}

if (isElectron) {
  const electron = window['require']('electron');
  console.log('In electron app.');
  // Register the altair URL scheme in the electron app
  electron.webFrame.registerURLSchemeAsPrivileged('altair');
};

platformBrowserDynamic().bootstrapModule(AppModule);

// initTracking();
handleExternalLinks();
