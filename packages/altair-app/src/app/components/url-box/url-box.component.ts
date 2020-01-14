import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OperationDefinitionNode } from 'graphql';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html'
})
export class UrlBoxComponent {
  @Input() apiUrl: string;
  @Input() httpVerb: string;
  @Input() isSubscribed = false;
  @Input() isLoading = false;
  @Input() showDocs = false;
  @Input() selectedOperation = '';
  @Input() queryOperations = [];
  @Input() streamState = '';
  @Input() currentCollection = null;

  @Output() toggleDocsChange = new EventEmitter();
  @Output() reloadDocsChange = new EventEmitter();
  @Output() addToCollectionChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();
  @Output() urlChange = new EventEmitter();
  @Output() httpVerbChange = new EventEmitter();
  @Output() selectedOperationChange = new EventEmitter();
  @Output() exportWindowChange = new EventEmitter();
  @Output() updateQueryInCollectionChange = new EventEmitter();

  methods = ['POST', 'GET', 'PUT', 'DELETE'];

  constructor() { }

  setApiUrl() {
    this.urlChange.emit(this.apiUrl.trim());
  }

  setVerb(verb: string) {
    this.httpVerbChange.emit(verb);
  }

  queryOperationTrackBy(index: number, operation: OperationDefinitionNode) {
    return operation.name && operation.name.value;
  }
}
