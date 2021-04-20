import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../modules/shared/shared.module';

import { DocViewerComponent } from './doc-viewer/doc-viewer.component';
import { DocViewerFieldComponent } from './doc-viewer-field/doc-viewer-field.component';
import { DocViewerTypeComponent } from './doc-viewer-type/doc-viewer-type.component';
import { DocViewerSearchResultsComponent } from './doc-viewer-search-results/doc-viewer-search-results.component';
import { ComponentModule } from '../components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ComponentModule,
  ],
  declarations: [
    DocViewerComponent,
    DocViewerFieldComponent,
    DocViewerTypeComponent,
    DocViewerSearchResultsComponent
  ],
  exports: [
    DocViewerComponent,
    DocViewerFieldComponent,
    DocViewerTypeComponent,
    DocViewerSearchResultsComponent
  ]
})
export class DocViewerModule { }
