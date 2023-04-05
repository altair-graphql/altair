import { TouchBar } from 'electron';
import { ActionManager } from './actions';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

export class TouchbarManager {
  private showDocsButton: TouchBarButton;
  private hideDocsButton: TouchBarButton;

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

    this.showDocsButton = new TouchBarButton({
      label: 'Show Docs',
      click: () => {
        this.actionManager.showDocs();
        this.removeShowDocsButton();
        this.addHideDocsButton();
      },
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
        this.showDocsButton,
      ],
    });

    return touchBar;
  }

  private removeShowDocsButton() {
    const { items } = this.showDocsButton.parent;
    const index = items.indexOf(this.showDocsButton);
    if (index !== -1) {
      items.splice(index, 1);
    }
  }

  private addHideDocsButton() {
    this.hideDocsButton = new TouchBarButton({
      label: 'Hide Docs',
      click: () => {
        this.actionManager.hideDocs();
        this.removeHideDocsButton();
        this.showDocsButton.addToTouchBar();
      },
    });
    const { items } = this.showDocsButton.parent;
    items.push(this.hideDocsButton);
  }

  private removeHideDocsButton() {
    const { items } = this.hideDocsButton.parent;
    const index = items.indexOf(this.hideDocsButton);
    if (index !== -1) {
      items.splice(index, 1);
    }
  }
}
