import { SCRIPT_INIT_EXECUTE } from './events';
import {
  AllScriptEventHandlers,
  ScriptContextData,
  ScriptEvaluatorClient,
  ScriptEvaluatorClientFactory,
  ScriptEvent,
  ScriptEventHandlers,
  ScriptTranformResult,
} from './types';

const DEFAULT_TIMEOUT = 1000 * 60 * 5; // 5 minutes

export class ScriptEvaluatorClientEngine {
  private client?: ScriptEvaluatorClient;

  constructor(
    private engineFactory: ScriptEvaluatorClientFactory,
    private timeout = DEFAULT_TIMEOUT
  ) {}

  private async getClient() {
    const client = this.client ?? (await this.engineFactory.create());
    this.client = client;
    return client;
  }

  async executeScript(
    script: string,
    data: ScriptContextData,
    userAvailableHandlers: ScriptEventHandlers
  ): Promise<ScriptTranformResult> {
    try {
      const engine = await this.getClient();
      const result = await new Promise<ScriptTranformResult>((resolve, reject) => {
        // Handle timeout
        const handle = setTimeout(() => {
          this.killClient();
          reject(new Error('script timeout'));
        }, this.timeout);

        const allHandlers: AllScriptEventHandlers = {
          ...userAvailableHandlers,
          executeComplete: (data: ScriptContextData) => {
            clearTimeout(handle);
            resolve({
              environment: data.environment,
              requestScriptLogs: data.requestScriptLogs || [],
              additionalHeaders: [],
            });
          },
          scriptError: (err: Error) => {
            clearTimeout(handle);
            reject(err);
          },
        } as const;

        // loop over all the script event handlers and create a listener for each
        // TODO: fn is of any type here. Figure out the typing
        Object.entries(allHandlers).forEach(([k, fn]) => {
          engine.subscribe(k as ScriptEvent, (key, event) => {
            // TODO: handle cancelling requests
            const { id, args } = event.payload;
            (async () => {
              try {
                const res = await fn(...args);
                engine.sendResponse(key, { id, response: res });
              } catch (err) {
                engine.sendError(key, {
                  id,
                  error: `${(err as any).message ?? err}`,
                });
              }
            })();
          });
        });

        engine.onError((e) => {
          clearTimeout(handle);
          reject(e);
        });
        engine.send(SCRIPT_INIT_EXECUTE, [script, data]);
      });

      return result;
    } finally {
      this.killClient();
    }
  }

  private killClient() {
    this.client?.destroy();
    this.client = undefined;
  }
}
