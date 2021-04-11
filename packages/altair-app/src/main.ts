import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableDebugTools } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
// import { environment } from './environments/environment';

// import { handleExternalLinks } from '../../utils/events';
// import { debug } from '../../utils/logger';
// import { AltairConfig, AltairConfigOptions, setAltairConfig } from '../../config';
// import { reducerToken, getReducer } from '../../store';
// import { handleDeprecations } from '../../utils/deprecated';

// let initialized = false;

// (window as any).AltairGraphQL = {
//   init(config: AltairConfigOptions = {}) {
//     if (initialized) {
//       return;
//     }
//     const altairConfig = new AltairConfig(config);
//     setAltairConfig(altairConfig);

//     if (environment.production) {
//       enableProdMode();
//     }

//     platformBrowserDynamic(
//       [
//         // Setting reducer provider here (after setting altair config),
//         // so the reducers are initialized with the right config
//         {
//           provide: reducerToken,
//           useValue: getReducer(),
//         },
//         {
//           provide: AltairConfig,
//           useValue: altairConfig,
//         },
//       ]
//     ).bootstrapModule(AppModule, {
//       preserveWhitespaces: true,
//     }).then(moduleRef => {
//       const applicationRef = moduleRef.injector.get(ApplicationRef);
//       const componentRef = applicationRef.components[0];

//       enableDebugTools(componentRef);
//     }).catch(err => debug.log('Error bootstrapping application:', err));

//     handleExternalLinks();
//     handleDeprecations();
//     initialized = true;
//   },
//   plugins: {},
// };
platformBrowserDynamic().bootstrapModule(AppModule, {
  preserveWhitespaces: true,
}).then(moduleRef => {
  const applicationRef = moduleRef.injector.get(ApplicationRef);
  const componentRef = applicationRef.components[0];

  enableDebugTools(componentRef);
});
