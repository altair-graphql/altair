import { Injectable, inject } from '@angular/core';
import { WebExtensionMessage } from 'altair-graphql-core/build/types/messaging';
import { WindowService } from '../window.service';
import { debug } from '../../utils/logger';
import { isExtension, sendMessage } from 'altair-graphql-core/build/crx';

@Injectable({
  providedIn: 'root',
})
export class WebExtensionsService {
  private windowService = inject(WindowService);


  connect() {
    const browser = window.browser || window.chrome;

    if (!isExtension) {
      return;
    }

    browser.runtime.onMessage.addListener(
      (message: WebExtensionMessage, sender, sendResponse) => {
        debug.log('Message received in webextension service', message);
        switch (message.type) {
          case 'import-window': {
            // Import window from the message data
            this.windowService.importWindowData(message.window);
            return;
          }
          case 'ping': {
            sendMessage({ type: 'pong' });
            return;
          }
          default: {
            debug.log('Unknown message type received', message);
            return;
          }
        }
      }
    );

    sendMessage({ type: 'ready' });
  }
}
