import {
  Component,
  Output,
  EventEmitter,
  input,
  effect,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { WORKSPACES } from 'altair-graphql-core/build/types/state/workspace.interface';
import {
  IQueryCollection,
  IQueryCollectionTree,
} from 'altair-graphql-core/build/types/state/collection.interfaces';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { QueryCollectionService } from '../../services';
import { WorkspaceOption } from '../../store';

@Component({
  selector: 'app-add-collection-query-dialog',
  templateUrl: './add-collection-query-dialog.component.html',
  styles: [],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCollectionQueryDialogComponent {
  readonly showDialog = input(false);
  readonly windowTitle = input('');
  readonly collections = input<IQueryCollection[]>([]);
  readonly loggedIn = input(false);
  readonly workspaces = input<WorkspaceOption[]>([]);

  @Output() toggleDialogChange = new EventEmitter();
  @Output() createCollectionAndSaveQueryToCollectionChange = new EventEmitter<{
    queryName: string;
    collectionName: string;
    parentCollectionId: string;
    workspaceId: string;
  }>();
  @Output() saveQueryToCollectionChange = new EventEmitter<{
    queryName: string;
    collectionId: string;
  }>();
  @Output() newCollectionParentCollectionIdChange = new EventEmitter();

  get parentCollectionRootId() {
    return '0'; // 0 for root
  }
  newCollectionQueryTitle = signal(this.windowTitle());
  newCollectionTitle = signal('');
  collectionId = signal('');
  newCollectionParentCollectionId = signal(this.parentCollectionRootId);
  workspaceId = signal(WORKSPACES.LOCAL);
  isNewCollection = computed(() => this.collectionId() === '-1');
  collectionNodes = computed(() => {
    const collectionTree = this.collectionService.getCollectionTrees(
      this.collections()
    );
    return collectionTree.map((tree) => this.collectionTreeToNzTreeNode(tree));
  });

  private resetEffect = effect(() => {
    if (this.windowTitle()) {
      this.reset();
    }
  });

  constructor(private collectionService: QueryCollectionService) {}

  createCollectionAndSaveQueryToCollection() {
    this.createCollectionAndSaveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle(),
      collectionName: this.newCollectionTitle(),
      parentCollectionId:
        this.newCollectionParentCollectionId() === '0'
          ? ''
          : this.newCollectionParentCollectionId(),
      workspaceId: this.workspaceId(),
    });

    this.reset();
  }

  saveQueryToCollection() {
    this.saveQueryToCollectionChange.emit({
      queryName: this.newCollectionQueryTitle(),
      collectionId: this.collectionId(),
    });

    this.reset();
  }

  onSaveChange() {
    if (this.isNewCollection()) {
      return this.createCollectionAndSaveQueryToCollection();
    }

    if (this.collectionId()) {
      return this.saveQueryToCollection();
    }
  }

  reset() {
    this.newCollectionQueryTitle.set(this.windowTitle());
    this.newCollectionTitle.set('');
  }

  trackById(index: number, item: { id: string }) {
    return item.id;
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
