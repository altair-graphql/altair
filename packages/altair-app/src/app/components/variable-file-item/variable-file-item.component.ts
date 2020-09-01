import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import * as fromVariables from 'app/store/variables/variables.reducer';
import { truncateText } from 'app/utils';

@Component({
  selector: 'app-variable-file-item',
  templateUrl: './variable-file-item.component.html',
  styles: [
  ]
})
export class VariableFileItemComponent implements OnInit, OnChanges {

  @Input() fileVariable: fromVariables.FileVariable;

  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter();
  @Output() fileVariableIsMultipleChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();

  @ViewChild('fileEl', { static: true }) fileEl: ElementRef<HTMLInputElement>;

  validFileData: File[] = [];
  invalidFileData = false;
  showWarning = false;
  filesText = '';

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.fileVariable?.currentValue?.data?.length) {
      this.validFileData = changes.fileVariable.currentValue.data.filter((data: any) => data instanceof File);
      this.invalidFileData = (this.fileVariable?.data as [])?.length > this.validFileData.length;
      this.showWarning = Boolean(!this.fileVariable?.isMultiple && (this.fileVariable.data as [])?.length > 1);

      if (this.invalidFileData) {
        this.filesText = 'Invalid file data. Select the file again.';
      } else if (this.showWarning) {
        this.filesText = 'In single mode, only the first file will be used.';
      } else if (this.validFileData.length) {
        this.filesText = this.validFileData.map(data => data.name).join(', ');
      } else {
        this.filesText = 'No files selected';
      }
      this.filesText = truncateText(this.filesText);
    }
  }

  onSelectFiles() {
    const files = this.fileEl.nativeElement.files;
    if (!files) {
      return;
    }

    return this.fileVariableDataChange.emit(Array.from(files));
  }
}
