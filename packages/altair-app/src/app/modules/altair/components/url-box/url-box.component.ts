import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import {
  HTTP_VERBS,
  HttpVerb,
} from 'altair-graphql-core/build/types/state/query.interfaces';
import { OperationDefinitionNode } from 'graphql';
import { BATCHED_REQUESTS_OPERATION } from '../../services/gql/gql.service';
import { LoadingRequestStateEntry } from 'altair-graphql-core/build/types/state/local.interfaces';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UrlBoxComponent {
  readonly apiUrl = model('');
  readonly httpVerb = input('POST');
  readonly isSubscribed = input(false);
  readonly isLoading = input(false);
  readonly showDocs = input(false);
  readonly selectedOperation = input('');
  readonly queryOperations = input<OperationDefinitionNode[]>([]);
  readonly streamState = input('');
  readonly currentCollection = input<IQueryCollection>();
  readonly hasUnsavedChanges = input(false);
  readonly windowId = input('');
  readonly requestState = input<LoadingRequestStateEntry[]>([]);

  readonly toggleDocsChange = output();
  readonly reloadDocsChange = output();
  readonly addToCollectionChange = output();
  readonly sendRequest = output();
  readonly urlChange = output<string>();
  readonly httpVerbChange = output<HttpVerb>();
  readonly selectedOperationChange = output<string | undefined>();
  readonly exportWindowChange = output();
  readonly updateQueryInCollectionChange = output();

  methods = HTTP_VERBS;

  BATCHED_REQUESTS_OPERATION = BATCHED_REQUESTS_OPERATION;

  setApiUrl() {
    const sanitizedUrl = this.sanitizeUrl(this.apiUrl());
    this.urlChange.emit(sanitizedUrl);
  }

  setVerb(verb: HttpVerb) {
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
