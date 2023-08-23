import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { HTTP_VERBS } from 'altair-graphql-core/build/types/state/query.interfaces';
import { OperationDefinitionNode } from 'graphql';
import { VARIABLE_REGEX } from '../../services/environment/environment.service';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html',
})
export class UrlBoxComponent {
  @Input() apiUrl = '';
  @Input() httpVerb = 'POST';
  @Input() isSubscribed = false;
  @Input() isLoading = false;
  @Input() showDocs = false;
  @Input() selectedOperation = '';
  @Input() queryOperations: OperationDefinitionNode[] = [];
  @Input() streamState = '';
  @Input() currentCollection?: IQueryCollection;

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

  setApiUrl() {
    this.urlChange.emit(this.sanitizeUrl(this.apiUrl));
  }

  setVerb(verb: string) {
    this.httpVerbChange.emit(verb);
  }

  sanitizeUrl(url: string) {
    // trim the url and remove any spaces
    // add http protocol if missing
    url = url.trim();
    if (!RegExp(/^[a-zA-Z]+:\/\//).exec(url) && !VARIABLE_REGEX.test(url)) {
      url = 'http://' + url;
    }

    return url;
  }

  queryOperationTrackBy(index: number, operation: OperationDefinitionNode) {
    return operation.name?.value;
  }
}
