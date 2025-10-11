import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input
} from '@angular/core';

@Component({
  selector: 'app-import-curl-dialog',
  templateUrl: './import-curl-dialog.component.html',
  styleUrls: ['./import-curl-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ImportCurlDialogComponent {
  readonly showImportCurlDialog = input(false);
  @Output() toggleDialogChange = new EventEmitter();
  @Output() importCurlChange = new EventEmitter<string>();

  textAreaInput = '';

  importInput() {
    this.toggleDialogChange.next(false);
    this.importCurlChange.next(this.textAreaInput);
  }
}
