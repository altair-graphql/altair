import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-deprecated',
  templateUrl: './doc-viewer-deprecated.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocViewerDeprecatedComponent {
  @Input() isDeprecated = false;
  @Input() deprecatedReason = '';
}
