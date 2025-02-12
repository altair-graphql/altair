import { WebExtensionMessage } from '../types/messaging';

const browser = window.chrome || window.browser;
export const isExtension = !!browser?.runtime?.id;
export const isFirefoxExtension = location.protocol === 'moz-extension:';

export const sendMessage = (message: WebExtensionMessage) => {
  const browser = window.chrome || window.browser;
  if (!isExtension) {
    // eslint-disable-next-line prettier/prettier, no-console
    console.log('Not running in an extension');
    // eslint-disable-next-line prettier/prettier, no-console
    console.log('Message:', message);
    return;
  }
  browser.runtime.sendMessage(message);
};
