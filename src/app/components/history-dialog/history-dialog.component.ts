import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html'
})
export class HistoryDialogComponent implements OnInit {

  @Input() historyList = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() restoreHistoryChange = new EventEmitter();
  @Output() clearHistoryChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  restoreHistory(index) {
    this.restoreHistoryChange.next(index);
    this.toggleDialogChange.next();
  }

  clearHistory() {
    this.clearHistoryChange.next();
  }

  trackByIndex(index) {
    return index;
  }
}
