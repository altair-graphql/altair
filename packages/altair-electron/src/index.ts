import unhandled from 'electron-unhandled';
import * as Sentry from '@sentry/electron';
import { ElectronApp } from './app';
import { app } from 'electron';
import { configureAppOnStartup } from './utils/startup';

Sentry.init({
  dsn: 'https://1b08762f991476e3115e1ab7d12e6682@o4506180788879360.ingest.sentry.io/4506198594813952',
  release: app.getVersion(),
});
configureAppOnStartup(app);
new ElectronApp();
unhandled({ showDialog: false });
