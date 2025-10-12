import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-import-curl-dialog',
  templateUrl: './import-curl-dialog.component.html',
  styleUrls: ['./import-curl-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ImportCurlDialogComponent {
  readonly showImportCurlDialog = input(false);
  readonly toggleDialogChange = output<boolean>();
  readonly importCurlChange = output<string>();

  textAreaInput = '';

  importInput() {
    this.toggleDialogChange.emit(false);
    this.importCurlChange.emit(this.textAreaInput);
  }
}
