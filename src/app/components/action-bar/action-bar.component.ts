import {
  Component,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent {

  @Input() showDocs;
  @Input() isSubscribed = false;
  @Output() toggleHeaderDialog = new EventEmitter();
  @Output() toggleVariableDialog = new EventEmitter();
  @Output() prettifyCodeChange = new EventEmitter();
  @Output() clearEditorChange = new EventEmitter();
  @Output() toggleSubscriptionUrlDialog = new EventEmitter();

  constructor() { }

}
