import './style.css';
import { ScriptEvaluatorWorkerEngine } from 'altair-graphql-core/build/script/evaluator-worker-engine';
import { EvaluatorFrameWorker } from './evaluator.frame';

new ScriptEvaluatorWorkerEngine(new EvaluatorFrameWorker()).start();
