import { QueryCollectionsComponent } from './query-collections.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxTestWrapper } from '../../../../../testing/wrapper';
import { mount } from '../../../../../testing/utils';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, expect } from '@jest/globals';
import { MockModule, MockComponent } from 'ng-mocks';
import { QueryCollectionItemComponent } from '../query-collection-item/query-collection-item.component';

describe('QueryCollectionsComponent', () => {
  let wrapper: NgxTestWrapper<QueryCollectionsComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: QueryCollectionsComponent,
      declarations: [ MockComponent(QueryCollectionItemComponent) ],
      imports: [
        MockModule(SharedModule),
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
    });
  });

  it('should create', () => {
    expect(wrapper.componentInstance).toBeTruthy();
  });

  it('should render passed collections correctly', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
        {
          id: 2,
          title: 'Collection 1',
          queries: []
        },
        {
          id: 3,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();
    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render passed collections', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
        {
          id: 2,
          title: 'Collection 2',
          queries: []
        },
        {
          id: 3,
          title: 'Collection 3',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItems = wrapper.findAll<QueryCollectionItemComponent>('app-query-collection-item');
    expect(collectionItems.length).toBe(3);
    expect(collectionItems[0].componentInstance.collection).toEqual({ id: 1, title: 'Collection 1', queries: [] });
    expect(collectionItems[1].componentInstance.collection).toEqual({ id: 2, title: 'Collection 2', queries: [] });
    expect(collectionItems[2].componentInstance.collection).toEqual({ id: 3, title: 'Collection 3', queries: [] });
  });

  it('should emit "selectQueryChange" from query-collection-item', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('selectQueryChange');

    expect(wrapper.emitted('selectQueryChange')).toBeTruthy();
  });

  it('should emit "deleteQueryChange" from query-collection-item', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('deleteQueryChange');

    expect(wrapper.emitted('deleteQueryChange')).toBeTruthy();
  });

  it('should emit "deleteCollectionChange" from query-collection-item', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('deleteCollectionChange');

    expect(wrapper.emitted('deleteCollectionChange')).toBeTruthy();
  });

  it('should emit "editCollectionChange" from query-collection-item', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('editCollectionChange');

    expect(wrapper.emitted('editCollectionChange')).toBeTruthy();
  });

  it('should emit "exportCollectionChange" from query-collection-item', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const collectionItem = wrapper.find('app-query-collection-item');

    collectionItem.emit('exportCollectionChange');

    expect(wrapper.emitted('exportCollectionChange')).toBeTruthy();
  });

  it('should emit "importCollectionsChange" when clicking import collection button', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const importCollectionsButton = wrapper.find('[data-test-id="import-collection"]');

    importCollectionsButton.emit('click');

    expect(wrapper.emitted('importCollectionsChange')).toBeTruthy();
  });

  it('should emit "sortCollectionsChange" when clicking one of the sort options', async() => {
    wrapper.setProps({
      showCollections: true,
      collections: [
        {
          id: 1,
          title: 'Collection 1',
          queries: []
        },
      ],
    });

    await wrapper.nextTick();

    const sortOption = wrapper.find('nz-dropdown-menu li');

    sortOption.emit('click');

    expect(wrapper.emitted('sortCollectionsChange')).toBeTruthy();
  });
});
