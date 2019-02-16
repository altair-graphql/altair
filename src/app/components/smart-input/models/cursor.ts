export class Cursor {
  offset: number = null;
  constructor(public selection: Selection = window.getSelection()) {
    this.offset = selection.focusOffset;
  }
}
