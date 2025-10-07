import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ApiService } from '../../services';
import { QueryItemRevision } from '@altairgraphql/db';
import { QueryItemRevisionWithUsername } from '@altairgraphql/api-utils';

@Component({
  selector: 'app-query-revision-dialog',
  templateUrl: './query-revision-dialog.component.html',
  styles: ``,
  standalone: false,
})
export class QueryRevisionDialogComponent implements OnChanges {
  @Input() showDialog = true;
  @Input() queryId = '';
  @Output() restoreRevision = new EventEmitter<QueryItemRevision>();
  @Output() toggleDialogChange = new EventEmitter<boolean>();

  revisions: QueryItemRevisionWithUsername[] = [];

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.queryId?.currentValue) {
      const queryId = changes.queryId.currentValue;
      // fetch revisions
      this.api.getQueryRevisions(queryId).then((res) => {
        this.revisions = res;
      });
    }
  }
}
