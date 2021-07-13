import { v4 as uuid } from 'uuid';

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
  ) {}

  destroy() {
    this.element = null as unknown as HTMLElement;
  }
}
