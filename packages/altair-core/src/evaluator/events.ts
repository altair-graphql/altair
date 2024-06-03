export const EVALUATOR_READY = 'evaluator::ready';
export const EVALUATOR_INIT_EXECUTE = 'init_execute';
export const getResponseEvent = <T extends string>(type: T) => `${type}_response`;
export const getErrorEvent = <T extends string>(type: T) => `${type}_error`;
