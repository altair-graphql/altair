import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { PostrequestState } from 'altair-graphql-core/build/types/state/postrequest.interfaces';
import { PrerequestState } from 'altair-graphql-core/build/types/state/prerequest.interfaces';

@Component({
  selector: 'app-edit-collection-dialog',
  templateUrl: './edit-collection-dialog.component.html',
  styleUrls: ['./edit-collection-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCollectionDialogComponent implements OnChanges {
  @Input() showEditCollectionDialog = true;
  @Input() collection?: IQueryCollection;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() importCurlChange = new EventEmitter<string>();
  @Output() updateCollectionChange = new EventEmitter<{
    collection: IQueryCollection;
  }>();

  title = '';
  preRequest: PrerequestState = { script: '', enabled: false };
  postRequest: PostrequestState = { script: '', enabled: false };

  ngOnChanges(changes: SimpleChanges) {
    if (changes.collection?.currentValue) {
      const collection = changes.collection?.currentValue as IQueryCollection;
      // setup form data fields
      this.title = collection.title;
      this.preRequest = collection.preRequest || { script: '', enabled: false };
      this.postRequest = collection.postRequest || {
        script: '',
        enabled: false,
      };
    }
  }

  updateCollection() {
    if (!this.collection) {
      throw new Error('this should never happen');
    }
    const collection = {
      ...this.collection,
      title: this.title,
      preRequest: this.preRequest,
      postRequest: this.postRequest,
    };
    this.toggleDialogChange.next(false);
    this.updateCollectionChange.next({ collection: collection });
  }
}
