import { ExportWindowState } from 'altair-graphql-core/build/types/state/window.interfaces';
import { WebExtensionMessage } from 'altair-graphql-core/build/types/messaging';
import { isExtension, sendMessage } from 'altair-graphql-core/build/crx';
import { openAltairApp } from './tabs';

export const openInAltair = (data: ExportWindowState) => {
  const browser = window.chrome || window.browser;
  if (!isExtension) {
    console.log('Not running in an extension');
    console.log('Data:', data);
    return;
  }
  openAltairApp();
  const callback = (message: WebExtensionMessage) => {
    console.log('Message received:', message);
    switch (message.type) {
      case 'pong':
      case 'ready': {
        // Wait for Altair to be ready to receive the message
        // Send a message to open the window in Altair
        sendMessage({
          type: 'import-window',
          window: data,
        });
        // Remove the listener after the message is sent
        browser.runtime.onMessage.removeListener(callback);
        return;
      }
      default: {
        console.log('Unknown message type:', message);
        return;
      }
    }
  };
  browser.runtime.onMessage.addListener(callback);

  setTimeout(() => {
    // Remove the listener after 10 seconds
    browser.runtime.onMessage.removeListener(callback);
  }, 10_000);

  // Send a ping message to check if Altair is ready
  sendMessage({
    type: 'ping',
  });
};
