export class Cursor {
  offset = null;
  constructor(private selection: Selection = window.getSelection()) {
    this.offset = selection.focusOffset;
  }
}
