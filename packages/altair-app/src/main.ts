import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableDebugTools } from '@angular/platform-browser';

import { AppModule } from 'app/app.module';
import { environment } from './environments/environment';

import { handleExternalLinks } from 'app/modules/altair/utils/events';
import { handleDeprecations } from 'app/modules/altair/utils/deprecated';
import { debug } from 'app/modules/altair/utils/logger';
import { AltairConfig, AltairConfigOptions, setAltairConfig } from 'altair-graphql-core/build/config';

let initialized = false;

(window as any).AltairGraphQL = {
  init(configOptions: AltairConfigOptions = {}) {
    if (initialized) {
      return;
    }
    const altairConfig = new AltairConfig(configOptions);
    setAltairConfig(altairConfig);

    if (environment.production) {
      enableProdMode();
    }

    platformBrowserDynamic(
      [
        {
          provide: AltairConfig,
          useValue: altairConfig,
        },
      ]
    ).bootstrapModule(AppModule, {
      preserveWhitespaces: true,
    }).then(moduleRef => {
      const applicationRef = moduleRef.injector.get(ApplicationRef);
      const componentRef = applicationRef.components[0];

      enableDebugTools(componentRef);
    }).catch(err => debug.log('Error bootstrapping application:', err));

    handleExternalLinks();
    handleDeprecations();
    initialized = true;
  },
  plugins: {},
};
