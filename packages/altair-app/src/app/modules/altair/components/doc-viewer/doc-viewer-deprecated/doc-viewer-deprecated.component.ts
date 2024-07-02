import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-doc-viewer-deprecated',
  templateUrl: './doc-viewer-deprecated.component.html',
  styles: [],
})
export class DocViewerDeprecatedComponent {
  @Input() isDeprecated = false;
  @Input() deprecatedReason = '';
}
