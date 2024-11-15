import { App } from 'electron';
import { PersistentStore } from '../store';

interface StartupOptionsStore {
  DISABLE_HARDWARE_ACCELERATION: boolean;
}
const startupOptionsStore = new PersistentStore<StartupOptionsStore>({
  defaults: {
    DISABLE_HARDWARE_ACCELERATION: false,
  },
});
function disableHardwareAcceleration(app: App) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.disableHardwareAcceleration();
}
export function getStartupOption<T extends keyof StartupOptionsStore>(option: T) {
  return startupOptionsStore.get(option);
}
export function setStartupOption<T extends keyof StartupOptionsStore>(
  option: T,
  value: StartupOptionsStore[T]
) {
  startupOptionsStore.set(option, value);
}

export function configureAppOnStartup(app: App) {
  if (startupOptionsStore.get('DISABLE_HARDWARE_ACCELERATION')) {
    disableHardwareAcceleration(app);
  }
}
