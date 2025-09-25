import { TouchBar } from 'electron';
import { ActionManager } from './actions';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

export class TouchbarManager {
  private docsButton: Electron.TouchBarButton;
  private touchBar: Electron.TouchBar;
  private docsVisible = false;

  constructor(private actionManager: ActionManager) {}

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

    this.docsButton = new TouchBarButton({
      label: 'Show Docs',
      click: () => this.actionManager.showDocs(),
    });

    const spacer = new TouchBarSpacer({
      size: 'flexible',
    });

    this.touchBar = new TouchBar({
      items: [
        // spin,
        sendRequestButton,
        spacer,
        reloadDocsButton,
        this.docsButton,
      ],
    });

    return this.touchBar;
  }

  updateDocsButtonState(docsVisible: boolean) {
    if (!this.docsButton) {
      return;
    }

    this.docsVisible = docsVisible;
    this.docsButton.label = docsVisible ? 'Hide Docs' : 'Show Docs';
  }
}
