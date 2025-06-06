import { PluginV3 } from 'altair-graphql-core/build/plugin/v3/plugin';
import { PluginV3Context } from 'altair-graphql-core/build/plugin/v3/context';
import { ApolloTracingPluginPanel } from './panel';
import { AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';

class ApolloTracingPlugin extends PluginV3 {
  constructor() {
    super({
      panels: {
        tracing: new ApolloTracingPluginPanel(),
      },
    });
  }

  async initialize(ctx: PluginV3Context) {
    await ctx.createPanel('tracing', {
      location: AltairPanelLocation.RESULT_PANE_BOTTOM,
      title: 'Tracing',
    });
  }

  async destroy() {}
}
console.log('Apollo Tracing plugin loaded!');
new ApolloTracingPlugin();
