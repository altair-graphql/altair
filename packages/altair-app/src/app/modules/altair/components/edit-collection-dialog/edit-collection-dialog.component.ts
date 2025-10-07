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
import { Extension } from '@codemirror/state';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';

@Component({
  selector: 'app-edit-collection-dialog',
  templateUrl: './edit-collection-dialog.component.html',
  styleUrls: ['./edit-collection-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
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
  environmentVariablesStr = '{}';

  editorExtensions: Extension[] = [json(), linter(jsonParseLinter())];

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
      this.environmentVariablesStr = collection.environmentVariables
        ? JSON.stringify(collection.environmentVariables, null, 2)
        : '{}';
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
      environmentVariables: JSON.parse(this.environmentVariablesStr),
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

  updateHeaderKey(key: string, index: number) {
    this.headers = this.headers.map((header, i) =>
      i === index ? { ...header, key } : header
    );
  }

  updateHeaderValue(value: string, index: number) {
    this.headers = this.headers.map((header, i) =>
      i === index ? { ...header, value } : header
    );
  }

  updateHeaderEnabled(enabled: boolean, index: number) {
    this.headers = this.headers.map((header, i) =>
      i === index ? { ...header, enabled } : header
    );
  }

  onEnvironmentVariablesChange(value: string) {
    this.environmentVariablesStr = value;
  }
}
