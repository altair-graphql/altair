import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Team } from 'altair-graphql-core/build/types/state/account.interfaces';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import {
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable } from 'rxjs';
import { QueryCollectionService } from '../../services';
import { capitalize } from '../../utils';
import { WorkspaceOption } from '../../store';

@Component({
  selector: 'app-add-collection-query-dialog',
  templateUrl: './add-collection-query-dialog.component.html',
  styles: [],
  standalone: false,
})
export class AddCollectionQueryDialogComponent implements OnChanges {
  @Input() showDialog = false;
  @Input() windowTitle = '';
  @Input() collections: IQueryCollection[] = [];
  @Input() loggedIn = false;
  @Input() workspaces: WorkspaceOption[] = [];

  @Output() toggleDialogChange = new EventEmitter();
  @Output() createCollectionAndSaveQueryToCollectionChange = new EventEmitter();
  @Output() saveQueryToCollectionChange = new EventEmitter();
  @Output() newCollectionParentCollectionIdChange = new EventEmitter();

  get parentCollectionRootId() {
    return '0'; // 0 for root
  }
  newCollectionQueryTitle = this.windowTitle;
  newCollectionTitle = '';
  collectionId = '';
  newCollectionParentCollectionId = this.parentCollectionRootId;
  collectionNodes?: NzTreeNodeOptions[];
  workspaceId = WORKSPACES.LOCAL;

  constructor(private collectionService: QueryCollectionService) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes?.windowTitle?.currentValue) {
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
      parentCollectionId:
        this.newCollectionParentCollectionId === '0'
          ? ''
          : this.newCollectionParentCollectionId,
      workspaceId: this.workspaceId,
    });

    this.reset();
  }

  saveQueryToCollection() {
    this.saveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle,
      collectionId: this.collectionId,
    });

    this.reset();
  }

  isNewCollection() {
    return this.collectionId === '-1';
  }

  onSaveChange() {
    if (this.isNewCollection()) {
      return this.createCollectionAndSaveQueryToCollection();
    }

    if (this.collectionId) {
      return this.saveQueryToCollection();
    }
  }

  reset() {
    this.newCollectionQueryTitle = this.windowTitle;
    this.newCollectionTitle = '';
  }

  trackById(index: number, item: { id: string }) {
    return item.id;
  }

  setTreeNodes(collections: IQueryCollection[]) {
    const collectionTree = this.collectionService.getCollectionTrees(collections);
    this.collectionNodes = collectionTree.map((tree) =>
      this.collectionTreeToNzTreeNode(tree)
    );
  }

  collectionTreeToNzTreeNode(
    collectionTree: IQueryCollectionTree
  ): NzTreeNodeOptions {
    return {
      title: collectionTree.title,
      key: `${collectionTree.id}`,
      children: collectionTree.collections?.map((ct) =>
        this.collectionTreeToNzTreeNode(ct)
      ),
    };
  }
}
