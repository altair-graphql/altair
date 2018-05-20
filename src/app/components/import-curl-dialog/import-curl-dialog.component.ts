import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-import-curl-dialog',
  templateUrl: './import-curl-dialog.component.html',
  styleUrls: ['./import-curl-dialog.component.scss']
})
export class ImportCurlDialogComponent implements OnInit {

  @Input() showImportCurlDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() importCurlChange = new EventEmitter<string>();

  textAreaInput = '';

  constructor() { }

  ngOnInit() {
  }

  importInput() {
    this.toggleDialogChange.next(false);
    this.importCurlChange.next(this.textAreaInput);
  }

}
