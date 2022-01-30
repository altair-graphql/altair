import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IQueryCollection, IQueryCollectionTree } from 'altair-graphql-core/build/types/state/collection.interfaces';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable } from 'rxjs';
import { QueryCollectionService } from '../../services';

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
  @Output() newCollectionParentCollectionIdChange = new EventEmitter();

  newCollectionQueryTitle = this.windowTitle;
  newCollectionTitle = '';
  collectionId = null;
  newCollectionParentCollectionId = 0; // 0 for root
  collectionNodes: NzTreeNodeOptions[];

  constructor(
    private collectionService: QueryCollectionService,
  ) {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.windowTitle && changes.windowTitle.currentValue) {
      this.windowTitle = changes.windowTitle.currentValue;
      this.reset();
    }
    if (changes?.collections?.currentValue) {
      this.setTreeNodes(changes.collections.currentValue);
    }
  }

  createCollectionAndSaveQueryToCollection() {
    this.createCollectionAndSaveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle,
      collectionName: this.newCollectionTitle,
      parentCollectionId: this.newCollectionParentCollectionId,
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

  trackById(index: number, item: { id: string }) {
    return item.id;
  }

  setTreeNodes(collections: IQueryCollection[]) {
    const collectionTree = this.collectionService.getCollectionTrees(collections);
    this.collectionNodes = collectionTree.map(tree => this.collectionTreeToNzTreeNode(tree));
  }

  collectionTreeToNzTreeNode(collectionTree: IQueryCollectionTree): NzTreeNodeOptions {
    return {
      title: collectionTree.title,
      key: `${collectionTree.id}`,
      children: collectionTree.collections?.map(ct => this.collectionTreeToNzTreeNode(ct)),
    };
  }
}
