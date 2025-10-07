import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
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
  @Input() data = '';
  @Input() showDialog = false;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() dataChange = new EventEmitter<string>();

  editorExtensions: Extension[] = [json()];
}
