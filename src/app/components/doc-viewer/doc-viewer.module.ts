import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { DocViewerItemQueriesComponent } from './doc-viewer-item-queries/doc-viewer-item-queries.component';
import { DocViewerItemQueryDetailsComponent } from './doc-viewer-item-query-details/doc-viewer-item-query-details.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DocViewerComponent,
    DocViewerItemQueriesComponent,
    DocViewerItemQueryDetailsComponent
  ],
  exports: [
    DocViewerComponent,
    DocViewerItemQueriesComponent,
    DocViewerItemQueryDetailsComponent
  ]
})
export class DocViewerModule { }
