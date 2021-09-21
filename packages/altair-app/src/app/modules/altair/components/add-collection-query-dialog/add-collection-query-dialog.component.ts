import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IQueryCollection } from 'altair-graphql-core/build/types/state/collection.interfaces';

@Component({
  selector: 'app-add-collection-query-dialog',
  templateUrl: './add-collection-query-dialog.component.html',
  styles: [
  ]
})
export class AddCollectionQueryDialogComponent implements OnChanges {

  @Input() showDialog = false;
  @Input() windowTitle = '';
  @Input() collections: IQueryCollection[] = [];

  @Output() toggleDialogChange = new EventEmitter();
  @Output() createCollectionAndSaveQueryToCollectionChange = new EventEmitter();
  @Output() saveQueryToCollectionChange = new EventEmitter();

  newCollectionQueryTitle = this.windowTitle;
  newCollectionTitle = '';
  collectionId = null;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes.windowTitle && changes.windowTitle.currentValue) {
      this.windowTitle = changes.windowTitle.currentValue;
      this.reset();
    }
  }

  createCollectionAndSaveQueryToCollection() {
    this.createCollectionAndSaveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle,
      collectionName: this.newCollectionTitle
    });

    this.reset();
  }

  saveQueryToCollection() {
    this.saveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle,
      collectionId: this.collectionId
    });

    this.reset();
  }

  onSaveChange() {
    if (this.collectionId && this.collectionId !== -1) {
      return this.saveQueryToCollection();
    }
    return this.createCollectionAndSaveQueryToCollection();
  }

  reset() {
    this.newCollectionQueryTitle = this.windowTitle;
    this.newCollectionTitle = '';
    this.collectionId = null;
  }

  trackById(index: number, item: any) {
    return item.id;
  }

}
