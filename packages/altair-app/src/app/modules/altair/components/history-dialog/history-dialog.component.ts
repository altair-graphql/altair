import { Component, Input, Output, EventEmitter } from '@angular/core';
import { History } from 'altair-graphql-core/build/types/state/history.interfaces';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
})
export class HistoryDialogComponent {
  @Input() historyList: History[] = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() restoreHistoryChange = new EventEmitter();
  @Output() clearHistoryChange = new EventEmitter();

  constructor() {}

  restoreHistory(index: number) {
    this.restoreHistoryChange.emit(index);
    this.toggleDialogChange.emit();
  }

  clearHistory() {
    this.clearHistoryChange.emit();
  }

  trackByIndex(index: number, h: History) {
    return index;
  }
}
