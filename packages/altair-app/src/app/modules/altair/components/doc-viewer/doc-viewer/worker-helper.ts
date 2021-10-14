import * as Comlink from 'comlink';

export const getDocUtilsWorkerAsyncClass = () => Comlink.wrap(new Worker(new URL('../doc-utils.worker', import.meta.url), { type: 'module' }));
