/**
 * Specifies the capabilities (functionalities) available to the plugin.
 * In the future, this would be used to request the necessary permissions from the user.
 */
export type PluginCapabilities =
  | 'query:read'
  | 'query:write'
  | 'header:read'
  | 'header:write'
  | 'environment:read'
  | 'environment:write';
  