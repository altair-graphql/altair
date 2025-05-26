import { createRoot } from 'react-dom/client';
import { PluginV3Context } from 'altair-graphql-core/build/plugin/v3/context';
import { AltairV3Panel } from 'altair-graphql-core/build/plugin/v3/panel';
import Tracing, { TracingProps } from './components/Tracing/Tracing';
import { useEffect, useState } from 'react';
import { PluginWindowState } from 'altair-graphql-core/build/plugin/context/context.interface';

function getTracing(data: string) {
  try {
    const parsed = JSON.parse(data);
    return parsed?.extensions?.tracing;
  } catch (e) {
    // no-op
  }
  return undefined;
}
interface PanelProps {
  context: PluginV3Context;
}
const Panel = ({ context }: PanelProps) => {
  const [windows, setWindows] = useState<Record<string, PluginWindowState>>();
  const [activeWindowId, setActiveWindowId] = useState<string>();
  const updateWindow = (state?: PluginWindowState) => {
    if (!state) {
      return;
    }
    setWindows((prev) => ({
      ...prev,
      [state.windowId]: state,
    }));
  };
  useEffect(() => {
    context.getCurrentWindowState().then((state) => {
      if (!state) {
        return;
      }
      setActiveWindowId(state.windowId);
      updateWindow(state);
    });
    context.on('current-window.change', async ({ windowId }) => {
      setActiveWindowId(windowId);
      const state = await context.getWindowState(windowId);
      updateWindow(state);
    });
    context.on('query-result.change', async ({ windowId }) => {
      const state = await context.getWindowState(windowId);
      updateWindow(state);
    });
    context.on('query-result-meta.change', async ({ windowId }) => {
      const state = await context.getWindowState(windowId);
      updateWindow(state);
    });
  }, [context]);

  const tracingProps: TracingProps = {
    tracing: activeWindowId
      ? getTracing(windows?.[activeWindowId]?.queryResults.at(0) ?? '')
      : undefined,
    startTime: activeWindowId
      ? windows?.[activeWindowId]?.requestStartTime
      : undefined,
    endTime: activeWindowId ? windows?.[activeWindowId]?.requestEndTime : undefined,
  };

  return (
    <>
      <Tracing {...tracingProps} />
    </>
  );
};

export class ApolloTracingPluginPanel extends AltairV3Panel {
  create(ctx: PluginV3Context, container: HTMLElement): void {
    const root = createRoot(container);
    root.render(<Panel context={ctx} />);
  }
}
