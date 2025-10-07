import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { History } from 'altair-graphql-core/build/types/state/history.interfaces';

@Component({
  selector: 'app-history-dialog',
  templateUrl: './history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HistoryDialogComponent {
  @Input() historyList: History[] = [];
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() restoreHistoryChange = new EventEmitter();
  @Output() clearHistoryChange = new EventEmitter();

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
