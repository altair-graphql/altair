import { QueryCollectionsComponent } from './query-collections.component';
import { SharedModule } from '../../modules/shared/shared.module';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, expect } from '@jest/globals';
import { MockModule, MockComponent, MockService, MockProvider } from 'ng-mocks';
import { QueryCollectionItemComponent } from '../query-collection-item/query-collection-item.component';
import {
  AccountService,
  ApiService,
  QueryCollectionService,
  StorageService,
} from '../../services';
import { of } from 'rxjs';
import { IQueryCollectionTree } from 'altair-graphql-core/build/types/state/collection.interfaces';

describe('QueryCollectionsComponent', () => {
  let wrapper: NgxTestWrapper<QueryCollectionsComponent>;
  let mockQueryCollectionService: jest.Mocked<QueryCollectionService>;

  beforeEach(async () => {
    mockQueryCollectionService = {
      getCollectionTrees: jest.fn(),
      getCollectionTree$: jest.fn(),
    } as any;

    wrapper = await mount({
      component: QueryCollectionsComponent,
      declarations: [MockComponent(QueryCollectionItemComponent)],
      imports: [MockModule(SharedModule)],
      providers: [
        { provide: QueryCollectionService, useValue: mockQueryCollectionService },
        StorageService,
        MockProvider(ApiService),
        MockProvider(AccountService),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render passed collections correctly', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
      {
        id: '2',
        title: 'Collection 2',
        queries: [],
      },
      {
        id: '3',
        title: 'Collection 3',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
      {
        id: '2',
        title: 'Collection 2',
        queries: [],
        collections: [],
      },
      {
        id: '3',
        title: 'Collection 3',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render passed collections', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
      {
        id: '2',
        title: 'Collection 2',
        queries: [],
      },
      {
        id: '3',
        title: 'Collection 3',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
      {
        id: '2',
        title: 'Collection 2',
        queries: [],
        collections: [],
      },
      {
        id: '3',
        title: 'Collection 3',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItems = wrapper.findAll<QueryCollectionItemComponent>(
      'app-query-collection-item'
    );
    expect(collectionItems.length).toBe(3);
    expect(collectionItems[0]!.componentInstance.collectionTree).toEqual({
      id: '1',
      title: 'Collection 1',
      queries: [],
      collections: [],
    });
    expect(collectionItems[1]!.componentInstance.collectionTree).toEqual({
      id: '2',
      title: 'Collection 2',
      queries: [],
      collections: [],
    });
    expect(collectionItems[2]!.componentInstance.collectionTree).toEqual({
      id: '3',
      title: 'Collection 3',
      queries: [],
      collections: [],
    });
  });

  it('should emit "selectQueryChange" from query-collection-item', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('selectQueryChange');

    expect(wrapper.emitted('selectQueryChange')).toBeTruthy();
  });

  it('should emit "deleteQueryChange" from query-collection-item', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('deleteQueryChange');

    expect(wrapper.emitted('deleteQueryChange')).toBeTruthy();
  });

  it('should emit "deleteCollectionChange" from query-collection-item', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('deleteCollectionChange');

    expect(wrapper.emitted('deleteCollectionChange')).toBeTruthy();
  });

  it('should emit "editCollectionChange" from query-collection-item', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('editCollectionChange');

    expect(wrapper.emitted('editCollectionChange')).toBeTruthy();
  });

  it('should emit "exportCollectionChange" from query-collection-item', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('exportCollectionChange');

    expect(wrapper.emitted('exportCollectionChange')).toBeTruthy();
  });

  it('should emit "importCollectionsChange" when clicking import collection button', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const importCollectionsButton = wrapper.find(
      '[data-test-id="import-collection"]'
    );

    importCollectionsButton.emit('click');

    expect(wrapper.emitted('importCollectionsChange')).toBeTruthy();
  });

  it('should emit "sortCollectionsChange" when clicking one of the sort options', async () => {
    const mockCollections = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
      },
    ];

    const mockCollectionTrees: IQueryCollectionTree[] = [
      {
        id: '1',
        title: 'Collection 1',
        queries: [],
        collections: [],
      },
    ];

    mockQueryCollectionService.getCollectionTrees.mockReturnValue(
      mockCollectionTrees
    );

    wrapper.setProps({
      showCollections: true,
      collections: mockCollections,
    });

    await wrapper.nextTick();
    await wrapper.nextTick();

    const sortMenuItem = wrapper.find('li[nz-menu-item]');

    sortMenuItem.emit('click');

    expect(wrapper.emitted('sortCollectionsChange')).toBeTruthy();
  });
});
