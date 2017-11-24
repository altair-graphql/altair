import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html'
})
export class UrlBoxComponent {
  @Input() apiUrl: string;
  @Input() verb: string;

  @Output() updatedUrl = new EventEmitter();
  @Output() updateRequestVerb = new EventEmitter();

  methods = ['POST', 'GET', 'PUT', 'DELETE'];

  @ViewChild('urlInput') urlInput;
  constructor() { }

  setApiUrl() {
    const url = this.urlInput.nativeElement.value;
    this.updatedUrl.emit(url);
  }

  setVerb(event: any) {
    this.verb = event.target.value;
  }
}
