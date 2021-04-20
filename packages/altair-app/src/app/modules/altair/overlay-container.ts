import { Injectable, OnDestroy } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class AppOverlayContainer extends OverlayContainer {

  _createContainer(): void {
    const container = document.createElement('div');
    container.classList.add('cdk-overlay-container');
    container.classList.add('app-overlay-container');

    const appWrapper = document.querySelector('.app-wrapper');
    if (appWrapper) {
      appWrapper.appendChild(container);
      this._containerElement = container;
    }
  }
}
