import { v4 as uuid } from 'uuid';
import { PluginParentEngine } from './v3/parent-engine';
import { SafeHtml } from '@angular/platform-browser';

export enum AltairPanelLocation {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
  RESULT_PANE_BOTTOM = 'result_pane_bottom',
}

/**
 * Used for dynamic panel elements. Can also be used for angular components in the future.
 */
export class AltairPanel {
  public id = uuid();
  public isActive = false;

  constructor(
    public title: string,
    public element: HTMLElement,
    public location: AltairPanelLocation,
    // TODO: Making this optional for now for backward compatibility. This should be required for v3 plugins.
    public engine?: PluginParentEngine,
    public iconUrl?: string,
    public iconSvg?: SafeHtml
  ) {}

  setActive(isActive: boolean) {
    this.isActive = isActive;
  }

  destroy() {
    this.element = null as unknown as HTMLElement;
  }
}
