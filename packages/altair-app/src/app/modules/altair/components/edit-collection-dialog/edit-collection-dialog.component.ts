import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

@Component({
  selector: 'app-edit-collection-dialog',
  templateUrl: './edit-collection-dialog.component.html',
  styleUrls: ['./edit-collection-dialog.component.scss']
})
export class EditCollectionDialogComponent  {

  @Input() showEditCollectionDialog = true;
  @Input() collection: IQueryCollection;
  @Output() toggleDialogChange = new EventEmitter();
  @Output() importCurlChange = new EventEmitter<string>();
  @Output() updateCollectionChange = new EventEmitter<{ collection: IQueryCollection }>();

  constructor() { }

  

  updateCollection() {
    this.toggleDialogChange.next(false);
    this.updateCollectionChange.next({ collection: this.collection });
  }
}
