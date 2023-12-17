import { Injectable, OnDestroy } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';

@Injectable()
export class AppOverlayContainer extends OverlayContainer {
  // constructor(document: any, _platform: Platform) {
  //   super(document, _platform);
  // }

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
