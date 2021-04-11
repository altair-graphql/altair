const DEPRECATED_WINDOW_CONFIG = [
  '__ALTAIR_ENDPOINT_URL__',
  '__ALTAIR_SUBSCRIPTIONS_ENDPOINT__',
  '__ALTAIR_INITIAL_QUERY__',
  '__ALTAIR_INITIAL_VARIABLES__',
  '__ALTAIR_INITIAL_HEADERS__',
  '__ALTAIR_INITIAL_PRE_REQUEST_SCRIPT__',
  '__ALTAIR_INSTANCE_STORAGE_NAMESPACE__',
];

const logDeprecatedMessage = (key: string) => {
  console.warn(`DEPRECATION NOTICE: Configuring altair using global variables is deprecated, and will be removed in a future version.`);
  console.warn(`You set [window.${key}], which is deprecated.`);
  console.warn(`Use 'AltairGraphQL.init(opts)' instead.`);
};

export const handleDeprecations = () => {
  DEPRECATED_WINDOW_CONFIG.forEach(key => {
    if ((window as any)[key]) {
      logDeprecatedMessage(key);
    }

    Object.defineProperty(window, key, {
      get() {
        return (window as any)[key];
      },
      set(value) {
        logDeprecatedMessage(key);
        (window as any)[key] = value;
      }
    });
  });
};
