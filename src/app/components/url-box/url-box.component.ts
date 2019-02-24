import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

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

  @Output() toggleDocsChange = new EventEmitter();
  @Output() reloadDocsChange = new EventEmitter();
  @Output() addToCollectionChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();
  @Output() urlChange = new EventEmitter();
  @Output() httpVerbChange = new EventEmitter();
  @Output() selectedOperationChange = new EventEmitter();
  @Output() exportWindowChange = new EventEmitter();

  methods = ['POST', 'GET', 'PUT', 'DELETE'];

  @ViewChild('urlInput') urlInput;
  constructor() { }

  setApiUrl() {
    const url: string = this.urlInput.nativeElement.value;
    this.urlChange.emit(url.trim());
  }
  setApiUrlFancy() {
    this.urlChange.emit(this.apiUrl.trim());
  }

  setVerb(verb) {
    this.httpVerbChange.emit(verb);
  }
}
