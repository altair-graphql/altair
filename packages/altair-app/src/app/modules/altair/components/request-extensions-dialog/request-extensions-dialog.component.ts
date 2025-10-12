import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { json } from '@codemirror/lang-json';
import { Extension } from '@codemirror/state';

@Component({
  selector: 'app-request-extensions-dialog',
  templateUrl: './request-extensions-dialog.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class RequestExtensionsDialogComponent {
  readonly data = input('');
  readonly showDialog = input(false);
  readonly toggleDialogChange = output<boolean>();
  readonly dataChange = output<string>();

  editorExtensions: Extension[] = [json()];
}
