import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  input
} from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { HTTP_VERBS } from 'altair-graphql-core/build/types/state/query.interfaces';
import { OperationDefinitionNode } from 'graphql';
import { BATCHED_REQUESTS_OPERATION } from '../../services/gql/gql.service';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UrlBoxComponent {
  @Input() apiUrl = '';
  readonly httpVerb = input('POST');
  readonly isSubscribed = input(false);
  readonly isLoading = input(false);
  readonly showDocs = input(false);
  @Input() selectedOperation = '';
  readonly queryOperations = input<OperationDefinitionNode[]>([]);
  @Input() streamState = '';
  readonly currentCollection = input<IQueryCollection>();
  readonly hasUnsavedChanges = input(false);
  readonly windowId = input('');

  @Output() toggleDocsChange = new EventEmitter();
  @Output() reloadDocsChange = new EventEmitter();
  @Output() addToCollectionChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();
  @Output() urlChange = new EventEmitter();
  @Output() httpVerbChange = new EventEmitter();
  @Output() selectedOperationChange = new EventEmitter();
  @Output() exportWindowChange = new EventEmitter();
  @Output() updateQueryInCollectionChange = new EventEmitter();

  methods = HTTP_VERBS;

  BATCHED_REQUESTS_OPERATION = BATCHED_REQUESTS_OPERATION;

  setApiUrl() {
    const sanitizedUrl = this.sanitizeUrl(this.apiUrl);
    this.urlChange.emit(sanitizedUrl);
  }

  setVerb(verb: string) {
    this.httpVerbChange.emit(verb);
  }

  sanitizeUrl(url: string) {
    // trim the url and remove any spaces
    // add http protocol if missing
    url = url.trim();
    if (!url) {
      return url;
    }
    const hasProtocol = /^[a-zA-Z]+:\/\//.test(url);
    const hasVariable = /{{.*}}/.test(url);
    if (!(hasProtocol || hasVariable)) {
      return 'http://' + url;
    }

    return url;
  }

  queryOperationTrackBy(index: number, operation: OperationDefinitionNode) {
    return operation.name?.value;
  }
}
