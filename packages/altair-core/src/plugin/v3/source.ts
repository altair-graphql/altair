import { z } from 'zod/v4';

/**
 * Defines the repository of the plugin.
 * Used to know where to get the plugin from.
 */
export const pluginSourceSchema = z.enum({
  NPM: 'npm',
  GITHUB: 'github',
  URL: 'url',
});
