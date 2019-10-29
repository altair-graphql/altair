import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { handleExternalLinks } from 'app/utils/events';
import { debug } from 'app/utils/logger';
import { enableDebugTools } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  preserveWhitespaces: true
}).then(moduleRef => {
  const applicationRef = moduleRef.injector.get(ApplicationRef);
  const componentRef = applicationRef.components[0];

  enableDebugTools(componentRef);
}).catch(err => debug.log('Error bootstrapping application:', err));

handleExternalLinks();
