import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionBarComponent {

  @Input() showDocs = false;
  @Input() isSubscribed = false;
  @Output() toggleHeaderDialog = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() toggleDocsChange = new EventEmitter();
  @Output() reloadDocsChange = new EventEmitter();
  @Output() prettifyCodeChange = new EventEmitter();
  @Output() sendRequest = new EventEmitter();
  @Output() clearEditorChange = new EventEmitter();
  @Output() toggleSubscriptionUrlDialog = new EventEmitter();

  constructor() { }

}
