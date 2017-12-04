import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html'
})
export class UrlBoxComponent {
  @Input() apiUrl: string;
  @Input() httpVerb: string;

  @Output() urlChange = new EventEmitter();
  @Output() httpVerbChange = new EventEmitter();

  methods = ['POST', 'GET', 'PUT', 'DELETE'];

  @ViewChild('urlInput') urlInput;
  constructor() { }

  setApiUrl() {
    const url = this.urlInput.nativeElement.value;
    this.urlChange.emit(url);
  }

  setVerb(event: any) {
    this.httpVerbChange.emit(event.target.value);
  }
}
