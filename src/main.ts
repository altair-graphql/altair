import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

if (window['process'] && window['process'].versions['electron']) {
  const electron = window['require']('electron');
  console.log('In electron app.');
  // Register the altair URL scheme in the electron app
  electron.webFrame.registerURLSchemeAsPrivileged('altair');
};

platformBrowserDynamic().bootstrapModule(AppModule);
