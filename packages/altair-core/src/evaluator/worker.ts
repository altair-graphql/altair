import { v4 as uuid } from 'uuid';
import { getErrorEvent, getResponseEvent } from './events';
export interface EventData<T extends string, P = unknown> {
  type: T;
  payload: P;
}
export abstract class EvaluatorWorker {
  abstract onMessage<T extends string, P = unknown>(
    handler: (e: EventData<T, P>) => void
  ): void;
  abstract send<T extends string>(type: T, payload?: unknown): void;
  abstract onError(handler: (err: unknown) => void): void;
  abstract destroy(): void;

  subscribe<T extends string, P = unknown>(
    type: T,
    handler: (type: T, e: EventData<T, P>) => void
  ): void {
    this.onMessage((e: EventData<T, P>) => {
      // Handle script events
      if (e.type === type) {
        handler(type, e);
      }
    });
  }

  request<T extends string, R = unknown>(
    type: T,
    ...args: unknown[]
  ): Promise<R | undefined> {
    return new Promise<R | undefined>((resolve, reject) => {
      const id = uuid();
      // TODO: cleanup listener
      this.onMessage<string, { id: string; response?: R; error?: unknown }>((e) => {
        switch (e.type) {
          case getResponseEvent(type): {
            if (e.payload.id !== id) {
              return;
            }
            return resolve(e.payload.response);
          }
          case getErrorEvent(type): {
            if (e.payload.id !== id) {
              return;
            }
            return reject(e.payload.error);
          }
        }
      });
      this.send(type, { id, args });
    });
  }

  respond<T extends string, R = unknown>(
    type: T,
    handler: (...args: unknown[]) => Promise<R>
  ): void {
    this.subscribe<T, { id: string; args: unknown[] }>(type, async (type, e) => {
      // TODO: handle cancelling requests
      // TODO: allow for multiple responses, or a single response
      const { id, args } = e.payload;
      try {
        const res = await handler(...args);
        this.send(getResponseEvent(type), { id, response: res });
      } catch (err) {
        this.send(getErrorEvent(type), {
          id,
          error: `${(err as any).message ?? err}`,
        });
      }
    });
  }
}
