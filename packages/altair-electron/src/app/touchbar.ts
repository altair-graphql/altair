import { BrowserWindow, TouchBar } from 'electron';
import { ActionManager } from './actions';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

export class TouchbarManager {
  constructor(private actionManager: ActionManager, private windowInstance: BrowserWindow) {}

  createTouchBar() {
    const sendRequestButton = new TouchBarButton({
      label: 'Send Request',
      backgroundColor: '#7EBC59',
      click: () => this.actionManager.sendRequest(),
    });

    const reloadDocsButton = new TouchBarButton({
      label: 'Reload Docs',
      click: () => this.actionManager.reloadDocs(),
    });

    const showDocsButton = new TouchBarButton({
      label: 'Show Docs',
      enabled: !this.windowInstance.webContents.showDocs,
      click: () => this.actionManager.showDocs(),
    });

    const hideDocsButton = new TouchBarButton({
      label: 'Hide Docs',
      enabled: this.windowInstance.webContents.showDocs,
      click: () => this.actionManager.hideDocs(),
    });

    const spacer = new TouchBarSpacer({
      size: 'flexible',
    });

    const touchBar = new TouchBar({
      items: [
        // spin,
        sendRequestButton,
        spacer,
        reloadDocsButton,
        showDocsButton,
        hideDocsButton,
      ],
    });

    return touchBar;
  }
}
