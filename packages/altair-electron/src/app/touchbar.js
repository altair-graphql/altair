// @ts-check
const { TouchBar } = require('electron');

const { TouchBarButton, TouchBarSpacer } = TouchBar;

class TouchbarManager {
  /**
   * @param {import('./actions')} actionManager action manager
   */
  constructor(actionManager) {
    this.actionManager = actionManager;
  }

  createTouchBar() {

    const sendRequestButton = new TouchBarButton({
      label: 'Send Request',
      backgroundColor: '#7EBC59',
      click: this.actionManager.sendRequest,
    });

    const reloadDocsButton = new TouchBarButton({
      label: 'Reload Docs',
      click: this.actionManager.reloadDocs,
    });

    const showDocsButton = new TouchBarButton({
      label: 'Show Docs',
      click: this.actionManager.showDocs
    });

    const spacer = new TouchBarSpacer({
      size: 'flexible'
    });

    const touchBar = new TouchBar({
      items: [
        // spin,
        sendRequestButton,
        spacer,
        reloadDocsButton,
        showDocsButton,
      ]
    });

    return touchBar;
  }
}

module.exports = TouchbarManager;
