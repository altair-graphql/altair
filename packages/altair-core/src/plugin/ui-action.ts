import { v4 as uuid } from 'uuid';

export enum AltairUiActionLocation {
  RESULT_PANE = 'result_pane',
}

export class AltairUiAction {
  public id = uuid();

  constructor(
    public title: string,
    public location: AltairUiActionLocation,
    public callback: () => void,
  ) {}

  execute() {
    this.callback();
  }
}
