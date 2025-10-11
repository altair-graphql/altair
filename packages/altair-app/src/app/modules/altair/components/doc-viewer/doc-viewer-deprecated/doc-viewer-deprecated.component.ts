import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-deprecated',
  templateUrl: './doc-viewer-deprecated.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocViewerDeprecatedComponent {
  readonly isDeprecated = input(false);
  readonly deprecatedReason = input('');
}
