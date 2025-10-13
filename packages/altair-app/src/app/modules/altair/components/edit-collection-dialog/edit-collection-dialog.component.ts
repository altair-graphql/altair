import {
  Component,
  ChangeDetectionStrategy,
  input,
  linkedSignal,
  output,
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
export class EditCollectionDialogComponent {
  readonly showEditCollectionDialog = input(true);
  readonly collection = input<IQueryCollection>();
  readonly toggleDialogChange = output<boolean>();
  readonly importCurlChange = output<string>();
  readonly updateCollectionChange = output<{
    collection: IQueryCollection;
  }>();
  readonly title = linkedSignal(() => this.collection()?.title || '');
  readonly preRequest = linkedSignal<PrerequestState>(
    () => this.collection()?.preRequest || { script: '', enabled: false }
  );
  readonly postRequest = linkedSignal<PostrequestState>(
    () => this.collection()?.postRequest || { script: '', enabled: false }
  );
  readonly headers = linkedSignal<HeaderState>(
    () => this.collection()?.headers || []
  );
  readonly environmentVariablesStr = linkedSignal(() => {
    const env = this.collection()?.environmentVariables;
    return env ? JSON.stringify(env, null, 2) : '{}';
  });

  editorExtensions: Extension[] = [json(), linter(jsonParseLinter())];

  updateCollection() {
    const collectionValue = this.collection();
    if (!collectionValue) {
      throw new Error('Collection is required to update');
    }
    const collection = {
      ...collectionValue,
      title: this.title(),
      preRequest: this.preRequest(),
      postRequest: this.postRequest(),
      headers: this.headers(),
      environmentVariables: JSON.parse(this.environmentVariablesStr()),
    };
    this.toggleDialogChange.emit(false);
    this.updateCollectionChange.emit({ collection: collection });
  }

  addHeader() {
    this.headers.update((headers) => [
      ...headers,
      { key: '', value: '', enabled: true },
    ]);
  }

  removeHeader(index: number) {
    this.headers.update((headers) => headers.filter((_, i) => i !== index));
  }

  updateHeaderKey(key: string, index: number) {
    this.headers.update((headers) =>
      headers.map((header, i) => (i === index ? { ...header, key } : header))
    );
  }

  updateHeaderValue(value: string, index: number) {
    this.headers.update((headers) =>
      headers.map((header, i) => (i === index ? { ...header, value } : header))
    );
  }

  updateHeaderEnabled(enabled: boolean, index: number) {
    this.headers.update((headers) =>
      headers.map((header, i) => (i === index ? { ...header, enabled } : header))
    );
  }

  onEnvironmentVariablesChange(value: string) {
    this.environmentVariablesStr.set(value);
  }

  updatePreRequestScript(script: string) {
    this.preRequest.update((pre) => ({ ...pre, script }));
  }

  updatePreRequestEnabled(enabled: boolean) {
    this.preRequest.update((pre) => ({ ...pre, enabled }));
  }
  updatePostRequestScript(script: string) {
    this.postRequest.update((post) => ({ ...post, script }));
  }

  updatePostRequestEnabled(enabled: boolean) {
    this.postRequest.update((post) => ({ ...post, enabled }));
  }
}
