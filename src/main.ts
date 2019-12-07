import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { handleExternalLinks } from 'app/utils/events';
import { debug } from 'app/utils/logger';
import { enableDebugTools } from '@angular/platform-browser';
import { AltairConfig, AltairConfigOptions, setAltairConfig } from 'app/config';

(window as any).AltairGraphQL = {
  init(config: AltairConfigOptions) {
    const altairConfig = new AltairConfig(config);
    setAltairConfig(altairConfig);

    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic(
      [
        {
          provide: AltairConfig,
          useValue: altairConfig,
        }
      ]
    ).bootstrapModule(AppModule, {
      preserveWhitespaces: true
    }).then(moduleRef => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      const componentRef = applicationRef.components[0];

      enableDebugTools(componentRef);
    }).catch(err => debug.log('Error bootstrapping application:', err));

    handleExternalLinks();
  }
};
