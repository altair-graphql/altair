import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { DocViewerFieldComponent } from './doc-viewer-field/doc-viewer-field.component';
import { DocViewerTypeComponent } from './doc-viewer-type/doc-viewer-type.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DocViewerComponent,
    DocViewerFieldComponent,
    DocViewerTypeComponent
  ],
  exports: [
    DocViewerComponent,
    DocViewerFieldComponent,
    DocViewerTypeComponent
  ]
})
export class DocViewerModule { }
