import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html'
})
export class HistoryDialogComponent  {

  @Input() historyList = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() restoreHistoryChange = new EventEmitter();
  @Output() clearHistoryChange = new EventEmitter();

  constructor() { }

  

  restoreHistory(index: number) {
    this.restoreHistoryChange.next(index);
    this.toggleDialogChange.next();
  }

  clearHistory() {
    this.clearHistoryChange.next();
  }

  trackByIndex(index: number) {
    return index;
  }
}
