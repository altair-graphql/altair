export interface PluginEventPayloadMap {
  'app-ready': boolean;
  'current-window.change': { windowId: string; };
  'query.change': { windowId: string; data: string; };
  'query-result.change': { windowId: string; data: any; };
  'query-result-meta.change': {
    windowId: string;
    data: {
      requestStartTime: number;
      requestEndTime: number;
      responseTime: number;
      responseStatus: number;
    };
  }
  'sdl.change': { windowId: string; data: string; };
};

export type PluginEvent = keyof PluginEventPayloadMap;
export type PluginEventCallback<T extends PluginEvent> = (payload: PluginEventPayloadMap[T]) => void;
