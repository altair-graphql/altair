import { TouchBar } from 'electron';
import { ActionManager } from './actions';
import { InteropStateManager } from '../interop-state-manager';
import { Subscription } from 'rxjs';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

export class TouchbarManager {
  private docsButton?: Electron.TouchBarButton;
  private docStateSubscription?: Subscription;
  constructor(
    private actionManager: ActionManager,
    private interopStateManager: InteropStateManager
  ) {}

  createTouchBar() {
    if (this.docStateSubscription) {
      this.docStateSubscription.unsubscribe();
    }

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

    const touchBar = new TouchBar({
      items: [
        // spin,
        sendRequestButton,
        spacer,
        reloadDocsButton,
        this.docsButton,
      ],
    });

    this.docStateSubscription = this.interopStateManager
      .asActiveWindowStateObservable()
      .subscribe((state) => {
        this.updateDocsButtonState(state.showDocs);
      });

    return touchBar;
  }

  updateDocsButtonState(docsVisible: boolean) {
    if (!this.docsButton) {
      return;
    }

    this.docsButton.label = docsVisible ? 'Hide Docs' : 'Show Docs';
  }
}
