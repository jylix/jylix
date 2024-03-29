import type { PluginContext } from '@zotera/types/api';

interface PluginOptions {
  minion: boolean;
}

export function register(ctx: PluginContext<PluginOptions>) {
  ctx.log.info('Registering routing plugin');
  ctx.log.info('Minion: ' + ctx.options.minion);

  ctx.routing.get('/', (_, res) => {
    ctx.log.info('Got request');
    res.send(`Hello ${ctx.options.minion}!`);
  });
}

export const options = {
  minion: {
    type: 'boolean',
    default: false,
  }
}
