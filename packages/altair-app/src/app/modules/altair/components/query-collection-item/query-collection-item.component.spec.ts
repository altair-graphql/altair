import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QueryCollectionItemComponent } from './query-collection-item.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPopperModule } from 'ngx-popper';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { MockModule, MockProvider, ngMocks } from 'ng-mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { expect } from '@jest/globals';
import { mock } from 'testing';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IQueryCollectionTree } from 'altair-graphql-core/build/types/state/collection.interfaces';
ngMocks.globalExclude(NzModalService);
describe('QueryCollectionItemComponent', () => {
  let wrapper: NgxTestWrapper<QueryCollectionItemComponent>;
  const collectionData: IQueryCollectionTree = {
    id: '1',
    title: 'collection-1',
    collections: [],
    queries: [
      {
        id: 'query1',
        windowName: 'Query 1',
        updated_at: 1594249795629,
        type: 'window',
        apiUrl: '',
        headers: [],
        query: '',
        subscriptionUrl: '',
        variables: '',
        version: 1,
      },
      {
        id: 'query2',
        windowName: 'Another Query',
        updated_at: 1594249790029,
        type: 'window',
        apiUrl: '',
        headers: [],
        query: '',
        subscriptionUrl: '',
        variables: '',
        version: 1,
      },
      {
        id: 'query3',
        windowName: 'Zap Query',
        updated_at: 1594249790629,
        type: 'window',
        apiUrl: '',
        headers: [],
        query: '',
        subscriptionUrl: '',
        variables: '',
        version: 1,
      },
    ],
  };

  beforeEach(async () => {
    wrapper = await mount({
      component: QueryCollectionItemComponent,
      imports: [MockModule(SharedModule)],
      providers: [
        {
          provide: NzModalService,
          useValue: mock<NzModalService>({
            confirm({ nzOnOk } = {}) {
              if (nzOnOk) {
                (nzOnOk as any)();
              }
              return true as any;
            },
          }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      propsData: {
        collectionTree: collectionData,
        queriesSortBy: 'newest',
      },
    });
  });

  it('should create', () => {
    expect(wrapper.component).toBeTruthy();
  });

  it('should render queries correctly', () => {
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should emit "selectQueryChange" with query info when query is clicked', () => {
    const queryItemTitle = wrapper.find('[data-test-id="query-item-title"]');
    queryItemTitle.emit('click');

    expect(wrapper.emitted('selectQueryChange')).toBeTruthy();
    const emittedObj = wrapper.emitted('selectQueryChange')![0][0];
    expect(emittedObj).toEqual({
      query: {
        id: 'query2',
        windowName: 'Another Query',
        updated_at: 1594249790029,
        type: 'window',
        apiUrl: '',
        headers: [],
        query: '',
        subscriptionUrl: '',
        variables: '',
        version: 1,
      },
      windowIdInCollection: 'query2',
      collectionId: '1',
    });
  });

  it('should emit "editCollectionChange" when edit collection is clicked', () => {
    const editCollectionButton = wrapper.find(
      '[data-test-id="edit-collection"]'
    );
    editCollectionButton.emit('click');

    expect(wrapper.emitted('editCollectionChange')).toBeTruthy();
    const emittedObj = wrapper.emitted('editCollectionChange')![0][0];
    expect(emittedObj).toEqual({
      collection: collectionData,
    });
  });

  it('should emit "exportCollectionChange" when export collection is clicked', () => {
    const exportCollectionButton = wrapper.find(
      '[data-test-id="export-collection"]'
    );
    exportCollectionButton.emit('click');

    expect(wrapper.emitted('exportCollectionChange')).toBeTruthy();
    const emittedObj = wrapper.emitted('exportCollectionChange')![0][0];
    expect(emittedObj).toEqual({
      collectionId: '1',
    });
  });

  it('should emit "deleteCollectionChange" when delete collection is clicked', () => {
    const deleteCollectionButton = wrapper.find(
      '[data-test-id="delete-collection"]'
    );
    deleteCollectionButton.emit('click');

    expect(wrapper.emitted('deleteCollectionChange')).toBeTruthy();
    const emittedObj = wrapper.emitted('deleteCollectionChange')![0][0];
    expect(emittedObj).toEqual({
      collectionId: '1',
    });
  });

  it('should emit "deleteQueryChange" when delete query is clicked', () => {
    const deleteQueryButton = wrapper.find('[data-test-id="delete-query"]');
    deleteQueryButton.emit('click');

    expect(wrapper.emitted('deleteQueryChange')).toBeTruthy();
    const emittedObj = wrapper.emitted('deleteQueryChange')![0][0];
    expect(emittedObj).toEqual({
      collectionId: '1',
      query: collectionData.queries[0],
    });
  });

  it('should sort rendered queries when sortBy (a-z) is clicked', async () => {
    const sortByButton = wrapper.find('[data-test-id="sort-queries-a-z"]');
    sortByButton.emit('click');

    await wrapper.nextTick();

    wrapper.emitted('sortCollectionQueriesChange');
    const emittedObj = wrapper.emitted('sortCollectionQueriesChange')![0][0];
    expect(emittedObj).toEqual('a-z');
  });

  it('should render collapsed collection correctly', async () => {
    const collapseButton = wrapper.find('[data-test-id="collection-collapse"]');
    collapseButton.emit('click');

    await wrapper.nextTick();

    expect(wrapper.element).toMatchSnapshot();
  });
});
