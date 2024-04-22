import debug from 'debug';

export const setLogging = (enable: boolean) =>
  enable ? enableLogging() : disableLogging();
export const enableLogging = () => debug.enable('cwex');
export const disableLogging = () => debug.disable();

export const log = debug('cwex');
export default log;
