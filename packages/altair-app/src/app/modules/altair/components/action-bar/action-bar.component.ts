import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input
} from '@angular/core';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ActionBarComponent {
  readonly showDocs = input(false);
  readonly isSubscribed = input(false);
  @Output() toggleHeaderDialog = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() toggleDocsChange = new EventEmitter();
  @Output() reloadDocsChange = new EventEmitter();
  @Output() prettifyCodeChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();
  @Output() clearEditorChange = new EventEmitter();
  @Output() toggleSubscriptionUrlDialog = new EventEmitter();
}
