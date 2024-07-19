import { PluginV3 } from 'altair-graphql-core/build/plugin/v3/plugin';
import { PluginV3Context } from 'altair-graphql-core/build/plugin/v3/context';
import { AiPluginPanel } from './panel';
import { AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';

class AiPlugin extends PluginV3 {
  constructor() {
    super({
      panels: {
        ai: new AiPluginPanel(),
      },
    });
  }

  async initialize(ctx: PluginV3Context) {
    console.log('PLUGIN initialize', ctx);
    console.log('PLUGIN isElectron', await ctx.getCurrentWindowState());
    ctx.on('query.change', (x) => {
      console.log('PLUGIN query.change', x);
    });

    await ctx.createPanel('ai', {
      location: AltairPanelLocation.SIDEBAR,
      width: 400,
    });
  }

  async destroy() {}
}
console.log('AI plugin loaded!');
new AiPlugin();
