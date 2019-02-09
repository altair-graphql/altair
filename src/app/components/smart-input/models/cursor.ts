export class Cursor {
  offset = null;
  constructor(public selection: Selection = window.getSelection()) {
    this.offset = selection.focusOffset;
  }
}
