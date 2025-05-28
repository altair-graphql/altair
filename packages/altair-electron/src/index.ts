import unhandled from 'electron-unhandled';
import * as Sentry from '@sentry/electron/main';
import { ElectronApp } from './app';
import { app } from 'electron';
import { configureAppOnStartup } from './utils/startup';
import { SENTRY_DSN } from './constants';

Sentry.init({
  dsn: SENTRY_DSN,
  release: app.getVersion(),
});
configureAppOnStartup(app);
new ElectronApp();
unhandled({ showDialog: false });
