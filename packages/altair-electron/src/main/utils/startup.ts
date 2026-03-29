import { App } from 'electron';
import { store } from '../settings/main/store';

function disableHardwareAcceleration(app: App) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.disableHardwareAcceleration();
}
export function getDisableHardwareAcceleration() {
  return store.get('disable_hardware_acceleration');
}
export function setDisableHardwareAcceleration(value: boolean) {
  store.set('disable_hardware_acceleration', value);
}

export function configureAppOnStartup(app: App) {
  if (store.get('disable_hardware_acceleration')) {
    disableHardwareAcceleration(app);
  }
}
