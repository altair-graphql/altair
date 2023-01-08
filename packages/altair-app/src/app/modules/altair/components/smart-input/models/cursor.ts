export class Cursor {
  offset = 0;
  constructor(public selection = window.getSelection()) {
    if (selection) {
      this.offset = selection.focusOffset;
    }
  }
}
