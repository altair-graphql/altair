export const PLUGIN_ENGINE_READY = 'plugin-engine::ready';
export const PLUGIN_SUBSCRIBE_TO_EVENT = 'plugin::subscribe_to_event';
export const PLUGIN_CREATE_ACTION_EVENT = 'plugin::create_action';
export const PLUGIN_GET_APP_STYLE_URL_EVENT = 'plugin::get_app_style_url';
export const getActionEvent = (actionId: string) => `action::${actionId}`;
