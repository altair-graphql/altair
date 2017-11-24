import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-url-box',
  templateUrl: './url-box.component.html'
})
export class UrlBoxComponent {
  @Input() apiUrl: string;
  @Output() updatedUrl = new EventEmitter();


  @ViewChild('urlInput') urlInput;
  constructor() { }

  setApiUrl() {
    const url = this.urlInput.nativeElement.value;
    this.updatedUrl.emit(url);
  }
}
