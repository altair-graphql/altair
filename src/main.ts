import { enableProdMode, ApplicationRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import isElectron from './app/utils/is_electron';
import { handleExternalLinks } from 'app/utils/events';
import { debug } from 'app/utils/logger';
import { enableDebugTools } from '@angular/platform-browser';

// import * as sandboxr from 'sandboxr';
// import { parse } from 'acorn';

// const ast = parse('1 + 2; obj;player.hello("x");');
// const env = sandboxr.createEnvironment();
// env.init();
// const obj = env.objectFactory.createObject();
// const o = env.createVariable('obj');
// o.setValue(obj);
// const playerObject = env.objectFactory.createObject();
// playerObject.define("hello", env.objectFactory.createFunction(function (name) {
//   console.log("Hello," + name.toNative());
//   console.log(debug);
// }));
// env.createVariable("player").setValue(playerObject);
// const sandbox = sandboxr.create(ast);
// const result = sandbox.execute(env);
// const nativeValue = result && result.toNative();
// console.log(result, nativeValue);
// console.log('I\'m in');

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
}).then(moduleRef => {
  const applicationRef = moduleRef.injector.get(ApplicationRef);
  const componentRef = applicationRef.components[0];

  enableDebugTools(componentRef);
}).catch(err => console.log(err));

handleExternalLinks();
