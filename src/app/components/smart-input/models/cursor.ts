export class Cursor {
  offset: number;
  constructor(public selection = window.getSelection()) {
    if (selection) {
      this.offset = selection.focusOffset;
    }
  }
}
