import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  input
} from '@angular/core';
import { FileVariable } from 'altair-graphql-core/build/types/state/variable.interfaces';
import { StorageService } from '../../services';
import { truncateText } from '../../utils';

@Component({
  selector: 'app-variable-file-item',
  templateUrl: './variable-file-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class VariableFileItemComponent implements OnInit, OnChanges {
  readonly fileVariable = input<FileVariable>();

  @Output() fileVariableNameChange = new EventEmitter();
  @Output() fileVariableDataChange = new EventEmitter<{
    files: File[];
    fromCache?: boolean;
  }>();
  @Output() fileVariableIsMultipleChange = new EventEmitter();
  @Output() deleteFileVariableChange = new EventEmitter();

  @ViewChild('fileEl', { static: true }) fileEl?: ElementRef<HTMLInputElement>;

  validFileData: File[] = [];
  invalidFileData = false;
  showWarning = false;
  filesText = '';

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    const fileVariable = this.fileVariable();
    if (fileVariable) {
      this.updateLocalState(fileVariable);
      if (this.invalidFileData) {
        if (fileVariable.id) {
          const selectedFiles = await this.storageService.selectedFiles.get(
            fileVariable.id
          );

          if (selectedFiles) {
            return this.fileVariableDataChange.emit({
              files: Array.from(selectedFiles.data),
              fromCache: true,
            });
          }
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
    if (!this.fileEl) {
      return;
    }

    const files = this.fileEl.nativeElement.files;
    if (!files) {
      return;
    }

    return this.fileVariableDataChange.emit({ files: Array.from(files) });
  }

  updateLocalState(fileVariable: FileVariable) {
    this.validFileData = Array.isArray(fileVariable.data)
      ? fileVariable.data.filter((data) => data instanceof File)
      : [];
    this.invalidFileData =
      (this.fileVariable()?.data as [])?.length > this.validFileData.length;
    this.showWarning = Boolean(
      !fileVariable?.isMultiple && (fileVariable.data as [])?.length > 1
    );

    if (this.invalidFileData) {
      this.filesText = 'Invalid file data. Select the file again.';
    } else if (this.showWarning) {
      this.filesText = 'In single mode, only the first file will be used.';
    } else if (this.validFileData.length) {
      this.filesText = this.validFileData.map((data) => data.name).join(', ');
    } else {
      this.filesText = 'No files selected';
    }
    this.filesText = truncateText(this.filesText);
  }
}
