import { TouchBar } from "electron";
import { ActionManager } from "./actions";

const { TouchBarButton, TouchBarSpacer } = TouchBar;

export class TouchbarManager {
  constructor(private actionManager: ActionManager) {}

  createTouchBar() {
    const sendRequestButton = new TouchBarButton({
      label: "Send Request",
      backgroundColor: "#7EBC59",
      click: () => this.actionManager.sendRequest()
    });

    const reloadDocsButton = new TouchBarButton({
      label: "Reload Docs",
      click: () => this.actionManager.reloadDocs()
    });

    const showDocsButton = new TouchBarButton({
      label: "Show Docs",
      click: () => this.actionManager.showDocs()
    });

    const spacer = new TouchBarSpacer({
      size: "flexible"
    });

    const touchBar = new TouchBar({
      items: [
        // spin,
        sendRequestButton,
        spacer,
        reloadDocsButton,
        showDocsButton
      ]
    });

    return touchBar;
  }
}
