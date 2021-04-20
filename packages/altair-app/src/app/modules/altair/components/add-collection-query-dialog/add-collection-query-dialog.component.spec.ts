import { expect } from '@jest/globals';

import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { mount } from '../../../../../testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';
import { DialogComponent } from '../dialog/dialog.component';

describe('AddCollectionQueryDialogComponent', () => {
  let wrapper: NgxTestWrapper<AddCollectionQueryDialogComponent>;

  beforeEach(async() => {
    wrapper = await mount({
      component: AddCollectionQueryDialogComponent,
      declarations: [
        AddCollectionQueryDialogComponent,
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        SharedModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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

  it('should set showDialog on app-dialog with [showDialog]', async() => {
    const appDialog = wrapper.find<DialogComponent>('app-dialog');
    wrapper.setProps({ showDialog: true });

    expect(appDialog.componentInstance.showDialog).toBe(true);
  });

  it('should render correctly with [windowTitle]', async() => {
    wrapper.setProps({ windowTitle: 'my title' });
    await wrapper.nextTick();

    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render [windowTitle] in input', async() => {
    wrapper.setProps({ windowTitle: 'my title' });
    const input = wrapper.find('[data-test-id="collection-query-name"]');

    await wrapper.nextTick();

    expect(input.component.nativeElement.value).toBe('my title');
  });

  it('should render correctly with [collections]', async() => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: 1,
          queries: [],
        },
        {
          title: 'query 2',
          id: 2,
          queries: [],
        },
      ]
    });

    await wrapper.nextTick();

    expect(wrapper.component.nativeElement).toMatchSnapshot();
  });

  it('should render new collection name input when selected collection is -1', async() => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: 1,
          queries: [],
        },
        {
          title: 'query 2',
          id: 2,
          queries: [],
        },
      ]
    });

    const select = wrapper.find('nz-select');
    select.setValue(-1);

    await wrapper.nextTick();

    const newCollectionName = wrapper.find('[data-test-id="new-collection-name"]');

    expect(wrapper.componentInstance.collectionId).toBe(-1);
    expect(newCollectionName.exists()).toBeTruthy();
  });

  it('should emit createCollectionAndSaveQueryChange event when form is saved with new collection selected', async() => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: 1,
          queries: [],
        },
        {
          title: 'query 2',
          id: 2,
          queries: [],
        },
      ]
    });

    const queryNameInput = wrapper.find('[data-test-id="collection-query-name"]');
    queryNameInput.setValue('my query name');

    const select = wrapper.find('nz-select');
    select.setValue(-1);

    await wrapper.nextTick();

    const newCollectionNameInput = wrapper.find('[data-test-id="new-collection-name"]');
    newCollectionNameInput.setValue('my new collection name');

    const appDialog = wrapper.find('app-dialog');
    appDialog.emit('saveChange');

    expect(wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')).toBeTruthy();
    expect(wrapper.emitted('createCollectionAndSaveQueryToCollectionChange')![0][0]).toEqual({
      queryName: 'my query name',
      collectionName: 'my new collection name',
    });
  });

  it('should emit [saveQueryToCollectionChange] event when form is saved with existing collection', async() => {
    wrapper.setProps({
      collections: [
        {
          title: 'query 1',
          id: 1,
          queries: [],
        },
        {
          title: 'query 2',
          id: 2,
          queries: [],
        },
      ]
    });

    const queryNameInput = wrapper.find('[data-test-id="collection-query-name"]');
    queryNameInput.setValue('my query name');

    const select = wrapper.find('nz-select');
    select.setValue(2);

    const appDialog = wrapper.find('app-dialog');
    appDialog.emit('saveChange');

    expect(wrapper.emitted('saveQueryToCollectionChange')).toBeTruthy();
    expect(wrapper.emitted('saveQueryToCollectionChange')![0][0]).toEqual({
      queryName: 'my query name',
      collectionId: 2,
    });
  });
});
