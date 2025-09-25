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
import { HeaderState } from 'altair-graphql-core/build/types/state/header.interfaces';

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
  headers: HeaderState = [];

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
      this.headers = collection.headers || [];
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
      headers: this.headers,
    };
    this.toggleDialogChange.next(false);
    this.updateCollectionChange.next({ collection: collection });
  }

  addHeader() {
    this.headers = [...this.headers, { key: '', value: '', enabled: true }];
  }

  removeHeader(index: number) {
    this.headers = this.headers.filter((_, i) => i !== index);
  }

  updateHeaderKey(index: number, key: string) {
    this.headers = this.headers.map((header, i) => 
      i === index ? { ...header, key } : header
    );
  }

  updateHeaderValue(index: number, value: string) {
    this.headers = this.headers.map((header, i) => 
      i === index ? { ...header, value } : header
    );
  }

  updateHeaderEnabled(index: number, enabled: boolean) {
    this.headers = this.headers.map((header, i) => 
      i === index ? { ...header, enabled } : header
    );
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
