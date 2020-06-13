/// <reference lib="webworker" />
import * as Comlink from 'comlink';
import { DocUtils } from './doc-utils';

Comlink.expose(DocUtils);

// addEventListener('message', ({ data }) => {
//   const response = `worker response to ${data}`;
//   postMessage(response);
// });
