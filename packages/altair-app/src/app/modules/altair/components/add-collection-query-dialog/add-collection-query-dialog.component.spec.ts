import { expect } from '@jest/globals';

import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog.component';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { mount } from '../../../../../testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';
import { DialogComponent } from '../dialog/dialog.component';
import {
  AccountService,
  ApiService,
  QueryCollectionService,
  StorageService,
} from '../../services';
import { mock } from '../../../../../testing';
import { MockModule, MockProvider, MockService } from 'ng-mocks';

describe('AddCollectionQueryDialogComponent', () => {
  let wrapper: NgxTestWrapper<AddCollectionQueryDialogComponent>;

  beforeEach(async () => {
    wrapper = await mount({
      component: AddCollectionQueryDialogComponent,
      declarations: [AddCollectionQueryDialogComponent],
      providers: [
        QueryCollectionService,
        StorageService,
        MockProvider(ApiService),
        MockProvider(AccountService),
      ],
      imports: [NoopAnimationsModule, FormsModule, SharedModule],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  /**
   * Inputs
   * - showDialog
   * - windowTitle
   * - collections
   * - event: toggleDialog
   * - event: createCollectionAndSaveQuery
   * - event: saveQueryToCollection
   */

  it('should render correctly', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should set showDialog on app-dialog with [showDialog]', async () => {
    const appDialog = wrapper.find<DialogComponent>('app-dialog');
    wrapper.setProps({ showDialog: true });
    await wrapper.nextTick();

    expect(appDialog.componentInstance.showDialog()).toBe(true);
  });

  it('should render correctly with [windowTitle]', async () => {
    wrapper.setProps({ windowTitle: 'my title' });
    await wrapper.nextTick();

    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render [windowTitle] in input', async () => {
    wrapper.setProps({ windowTitle: 'my title' });
    const input = wrapper.find('[data-test-id="collection-query-name"]');

    await wrapper.nextTick();

    expect(input.component.nativeElement.value).toBe('my title');
  });

  it('should render correctly with [collections]', async () => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: '1',
          queries: [],
        },
        {
          title: 'query 2',
          id: '2',
          queries: [],
        },
      ],
    });

    await wrapper.nextTick();

    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render new collection name input when selected collection is -1', async () => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: '1',
          queries: [],
        },
        {
          title: 'query 2',
          id: '2',
          queries: [],
        },
      ],
    });

    const select = wrapper.find('nz-select');
    select.setValue('-1');

    await wrapper.nextTick();

    const newCollectionName = wrapper.find('[data-test-id="new-collection-name"]');

    expect(wrapper.componentInstance.collectionId()).toBe('-1');
    expect(newCollectionName.exists()).toBeTruthy();
  });

  it('should emit createCollectionAndSaveQueryChange event when form is saved with new collection selected', async () => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: '1',
          queries: [],
        },
        {
          title: 'query 2',
          id: '2',
          queries: [],
        },
      ],
    });

    const queryNameInput = wrapper.find('[data-test-id="collection-query-name"]');
    queryNameInput.setValue('my query name');

    const select = wrapper.find('nz-select');
    select.setValue('-1');

    await wrapper.nextTick();

    const newCollectionNameInput = wrapper.find(
      '[data-test-id="new-collection-name"]'
    );
    newCollectionNameInput.setValue('my new collection name');

    const appDialog = wrapper.find('app-dialog');
    appDialog.emit('saveChange');

    expect(
      wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')
    ).toBeTruthy();
    expect(
      wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')![0][0]
    ).toEqual({
      queryName: 'my query name',
      collectionName: 'my new collection name',
      parentCollectionId: '',
      workspaceId: 'local',
    });
  });

  it('should emit [saveQueryToCollectionChange] event when form is saved with existing collection', async () => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: '1',
          queries: [],
        },
        {
          title: 'query 2',
          id: '2',
          queries: [],
        },
      ],
    });

    const queryNameInput = wrapper.find('[data-test-id="collection-query-name"]');
    queryNameInput.setValue('my query name');

    const select = wrapper.find('nz-select');
    select.setValue('2');

    const appDialog = wrapper.find('app-dialog');
    appDialog.emit('saveChange');

    expect(wrapper.emitted('saveQueryToCollectionChange')).toBeTruthy();
    expect(wrapper.emitted('saveQueryToCollectionChange')![0][0]).toEqual({
      queryName: 'my query name',
      collectionId: '2',
    });
  });

  describe('createCollectionAndSaveQueryToCollection', () => {
    it('should emit createCollectionAndSaveQueryToCollectionChange with correct data', () => {
      wrapper.componentInstance.newCollectionQueryTitle.set('Test Query');
      wrapper.componentInstance.newCollectionTitle.set('Test Collection');
      wrapper.componentInstance.newCollectionParentCollectionId.set('0'); // root collection
      wrapper.componentInstance.workspaceId.set('local');

      wrapper.componentInstance.createCollectionAndSaveQueryToCollection();

      expect(
        wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')
      ).toBeTruthy();
      expect(
        wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')![0][0]
      ).toEqual({
        queryName: 'Test Query',
        collectionName: 'Test Collection',
        parentCollectionId: '',
        workspaceId: 'local',
      });
    });

    it('should use parentCollectionId when not root', () => {
      wrapper.componentInstance.newCollectionQueryTitle.set('Test Query');
      wrapper.componentInstance.newCollectionTitle.set('Test Collection');
      wrapper.componentInstance.newCollectionParentCollectionId.set('123');

      wrapper.componentInstance.createCollectionAndSaveQueryToCollection();

      expect(
        wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')![0][0]
      ).toEqual({
        queryName: 'Test Query',
        collectionName: 'Test Collection',
        parentCollectionId: '123',
        workspaceId: 'local',
      });
    });
  });

  describe('saveQueryToCollection', () => {
    it('should emit saveQueryToCollectionChange with correct data', () => {
      wrapper.componentInstance.newCollectionQueryTitle.set('Test Query');
      wrapper.componentInstance.collectionId.set('collection-123');

      wrapper.componentInstance.saveQueryToCollection();

      expect(wrapper.emitted('saveQueryToCollectionChange')).toBeTruthy();
      expect(wrapper.emitted('saveQueryToCollectionChange')![0][0]).toEqual({
        queryName: 'Test Query',
        collectionId: 'collection-123',
      });
    });
  });

  describe('onSaveChange', () => {
    it('should call createCollectionAndSaveQueryToCollection when isNewCollection is true', () => {
      wrapper.componentInstance.collectionId.set('-1'); // new collection

      wrapper.componentInstance.onSaveChange();

      expect(
        wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')
      ).toBeTruthy();
    });

    it('should call saveQueryToCollection when collectionId is set', () => {
      wrapper.componentInstance.collectionId.set('123');

      wrapper.componentInstance.onSaveChange();

      expect(wrapper.emitted('saveQueryToCollectionChange')).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should reset newCollectionQueryTitle and newCollectionTitle', () => {
      wrapper.componentInstance.newCollectionQueryTitle.set('Changed Title');
      wrapper.componentInstance.newCollectionTitle.set('Changed Collection');

      wrapper.componentInstance.reset();

      expect(wrapper.componentInstance.newCollectionQueryTitle()).toBe('');
      expect(wrapper.componentInstance.newCollectionTitle()).toBe('');
    });
  });

  describe('collectionTreeToNzTreeNode', () => {
    it('should convert collection tree to nz tree node', () => {
      const tree = {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      };

      const result = wrapper.componentInstance.collectionTreeToNzTreeNode(
        tree as any
      );

      expect(result).toEqual({
        title: 'Collection 1',
        key: '1',
        children: [],
      });
    });

    it('should handle nested collections', () => {
      const tree = {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [
          {
            id: '2',
            title: 'Nested Collection',
            queries: [],
            collections: [],
          },
        ],
      };

      const result = wrapper.componentInstance.collectionTreeToNzTreeNode(
        tree as any
      );

      expect(result.children).toHaveLength(1);
      expect(result.children![0]!.key).toBe('2');
    });
  });
});
