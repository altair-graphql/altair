import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FileVariable } from 'altair-graphql-core/build/types/state/variable.interfaces';
import { StorageService } from '../../services';
import * as fromVariables from '../../store/variables/variables.reducer';
import { truncateText } from '../../utils';

@Component({
  selector: 'app-variable-file-item',
  templateUrl: './variable-file-item.component.html',
  styles: [
  ]
})
export class VariableFileItemComponent implements OnInit, OnChanges {

  @Input() fileVariable: FileVariable;

  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter<{ files: File[], fromCache?: boolean }>();
  @Output() fileVariableIsMultipleChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();

  @ViewChild('fileEl', { static: true }) fileEl: ElementRef<HTMLInputElement>;

  validFileData: File[] = [];
  invalidFileData = false;
  showWarning = false;
  filesText = '';

  constructor(
    private storageService: StorageService,
  ) { }

  async ngOnInit() {
    this.updateLocalState(this.fileVariable);
    if (this.invalidFileData) {
      if (this.fileVariable.id) {
        const selectedFiles = await this.storageService.selectedFiles.get(this.fileVariable.id);

        if (selectedFiles) {
          return this.fileVariableDataChange.emit({ files: Array.from(selectedFiles.data), fromCache: true });
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.fileVariable?.currentValue?.data?.length) {
      this.updateLocalState(changes.fileVariable.currentValue);
    }
  }

  onSelectFiles() {
    const files = this.fileEl.nativeElement.files;
    if (!files) {
      return;
    }

    return this.fileVariableDataChange.emit({ files: Array.from(files) });
  }

  isValidFileData(fileVariable: FileVariable) {}

  updateLocalState(fileVariable: FileVariable) {
    this.validFileData = Array.isArray(fileVariable.data) ? fileVariable.data.filter((data: any) => data instanceof File) : [];
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
