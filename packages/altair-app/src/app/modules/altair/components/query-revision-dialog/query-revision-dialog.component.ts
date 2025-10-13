import {
  Component,
  input,
  inject,
  effect,
  signal,
  output
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
export class QueryRevisionDialogComponent {
  private api = inject(ApiService);

  readonly showDialog = input(true);
  readonly queryId = input('');
  readonly restoreRevision = output<QueryItemRevision>();
  readonly toggleDialogChange = output<boolean>();

  readonly revisions = signal<QueryItemRevisionWithUsername[]>([]);

  constructor() {
    effect(() => {
      const queryId = this.queryId();
      if (queryId) {
        // fetch revisions
        this.api
          .getQueryRevisions(queryId)
          .then((res) => {
            this.revisions.set(res);
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch query revisions:', error);
            this.revisions.set([]);
          });
      }
    });
  }
}
