import './style.css';
import { ScriptEvaluatorWorkerEngine } from 'altair-graphql-core/build/script/evaluator-worker-engine';
import { EvaluatorFrameWorker } from './evaluator.frame';
import { handlePluginSandbox } from './plugin-sandbox';

const searchParams = new URLSearchParams(window.location.search);
// TODO: Set sandbox type in parent worker
const sandboxType = searchParams.get('sandbox_type');
switch (sandboxType) {
  case 'plugin':
    handlePluginSandbox();
    break;
  case 'script':
  default:
    new ScriptEvaluatorWorkerEngine(new EvaluatorFrameWorker()).start();
}
