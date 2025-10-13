import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { History } from 'altair-graphql-core/build/types/state/history.interfaces';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HistoryDialogComponent {
  readonly historyList = input<History[]>([]);
  readonly showDialog = input(false);
  readonly toggleDialogChange = output<boolean>();
  readonly restoreHistoryChange = output<number>();
  readonly clearHistoryChange = output<void>();

  restoreHistory(index: number) {
    this.restoreHistoryChange.emit(index);
    this.toggleDialogChange.emit(false);
  }

  clearHistory() {
    this.clearHistoryChange.emit();
  }

  trackByIndex(index: number, h: History) {
    return index;
  }
}
