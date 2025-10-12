import {
  Component,
  ChangeDetectionStrategy,
  input,
  output
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
  readonly toggleHeaderDialog = output();
  readonly toggleVariableDialog = output();
  readonly toggleDocsChange = output();
  readonly reloadDocsChange = output();
  readonly prettifyCodeChange = output();
  readonly sendRequest = output();
  readonly clearEditorChange = output();
  readonly toggleSubscriptionUrlDialog = output();
}
