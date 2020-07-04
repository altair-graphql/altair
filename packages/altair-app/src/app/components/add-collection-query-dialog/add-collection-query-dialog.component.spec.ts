import { expect } from '@jest/globals';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/modules/shared/shared.module';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { setProps, setValue, mount } from '../../../testing/utils';
import { NgxTestWrapper } from 'testing/wrapper';

describe('AddCollectionQueryDialogComponent', () => {
  let wrapper: NgxTestWrapper<AddCollectionQueryDialogComponent>;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     declarations: [
  //       AddCollectionQueryDialogComponent,
  //     ],
  //     imports: [
  //       BrowserAnimationsModule,
  //       FormsModule,
  //       SharedModule,
  //     ],
  //     schemas: [ NO_ERRORS_SCHEMA ]
  //   })
  //   .compileComponents();
  // }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(AddCollectionQueryDialogComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  beforeEach(async() => {
    wrapper = await mount({
      declarations: [
        AddCollectionQueryDialogComponent,
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        SharedModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }, AddCollectionQueryDialogComponent);
    // await TestBed.configureTestingModule({
    //   declarations: [
    //     AddCollectionQueryDialogComponent,
    //   ],
    //   imports: [
    //     BrowserAnimationsModule,
    //     FormsModule,
    //     SharedModule,
    //   ],
    //   schemas: [ NO_ERRORS_SCHEMA ]
    // })
    // .compileComponents();
    // fixture = TestBed.createComponent(AddCollectionQueryDialogComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
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
    const appDialog = wrapper.debugElement.query(By.css('app-dialog'));
    await wrapper.setProps({ showDialog: true });

    expect(appDialog.componentInstance.showDialog).toBe(true);
  });

  // it('should render correctly with [windowTitle]', async() => {
  //   component.windowTitle = 'my title';
  //   // TODO: Should be fixed by using a test host component
  //   component.ngOnChanges({
  //     windowTitle: new SimpleChange(null, component.windowTitle, true)
  //   });
  //   fixture.detectChanges();
  //   await fixture.whenStable();
  //   expect(fixture.nativeElement).toMatchSnapshot();
  // });

  // it('should render [windowTitle] in input', async() => {
  //   component.windowTitle = 'my title';
  //   component.ngOnChanges({
  //     windowTitle: new SimpleChange(null, component.windowTitle, true)
  //   });
  //   fixture.detectChanges();
  //   await fixture.whenStable();
  //   const input = fixture.debugElement.query(By.css('[data-test-id="collection-query-name"]'));

  //   expect(input.nativeElement.value).toBe('my title');
  // });

  // it('should render correctly with [collections]', async() => {
  //   await setProps(fixture, {
  //     collections: [
  //       {
  //         title: 'query 1',
  //         id: 1,
  //         queries: [],
  //       },
  //       {
  //         title: 'query 2',
  //         id: 2,
  //         queries: [],
  //       },
  //     ]
  //   });

  //   expect(fixture.nativeElement).toMatchSnapshot();
  // });

  // it('should render new collection name input when selected collection is -1', async() => {
  //   await setProps(fixture, {
  //     collections: [
  //       {
  //         title: 'query 1',
  //         id: 1,
  //         queries: [],
  //       },
  //       {
  //         title: 'query 2',
  //         id: 2,
  //         queries: [],
  //       },
  //     ]
  //   });

  //   const select = fixture.debugElement.query(By.css('nz-select'));
  //   await setValue(fixture, select, -1);

  //   const newCollectionName = fixture.debugElement.query(By.css('[data-test-id="new-collection-name"]'));
  //   expect(component.collectionId).toBe(-1);
  //   expect(newCollectionName.nativeElement).toBeTruthy();
  // });

  // it('should emit createCollectionAndSaveQueryChange event when form is saved with new collection selected', async() => {
  //   setProps(fixture, {
  //     collections: [
  //       {
  //         title: 'query 1',
  //         id: 1,
  //         queries: [],
  //       },
  //       {
  //         title: 'query 2',
  //         id: 2,
  //         queries: [],
  //       },
  //     ]
  //   });

  //   const queryNameInput = fixture.debugElement.query(By.css('[data-test-id="collection-query-name"]'));
  //   await setValue(fixture, queryNameInput, 'my query name');

  //   const select = fixture.debugElement.query(By.css('nz-select'));
  //   await setValue(fixture, select, -1);

  //   const newCollectionNameInput = fixture.debugElement.query(By.css('[data-test-id="new-collection-name"]'));
  //   await setValue(fixture, newCollectionNameInput, 'my new collection name');

  //   const appDialog = fixture.debugElement.query(By.css('app-dialog'));
  //   const createCollectionAndSaveQueryChangeSpy = jest.spyOn(component.createCollectionAndSaveQueryToCollectionChange, 'emit');
  //   appDialog.triggerEventHandler('saveChange', null);

  //   expect(createCollectionAndSaveQueryChangeSpy).toHaveBeenCalledWith({
  //     queryName: 'my query name',
  //     collectionName: 'my new collection name',
  //   });
  // });

  // it('should emit [saveQueryToCollectionChange] event when form is saved with existing collection', async() => {
  //   await setProps(fixture, {
  //     collections: [
  //       {
  //         title: 'query 1',
  //         id: 1,
  //         queries: [],
  //       },
  //       {
  //         title: 'query 2',
  //         id: 2,
  //         queries: [],
  //       },
  //     ]
  //   });

  //   const queryNameInput = fixture.debugElement.query(By.css('[data-test-id="collection-query-name"]'));
  //   await setValue(fixture, queryNameInput, 'my query name');

  //   const select = fixture.debugElement.query(By.css('nz-select'));
  //   await setValue(fixture, select, 2);

  //   const appDialog = fixture.debugElement.query(By.css('app-dialog'));
  //   // TODO: requires test host component to apply spies automatically
  //   const saveQueryToCollectionChangeSpy = jest.spyOn(component.saveQueryToCollectionChange, 'emit');
  //   appDialog.triggerEventHandler('saveChange', null);

  //   expect(saveQueryToCollectionChangeSpy).toHaveBeenCalledWith({
  //     queryName: 'my query name',
  //     collectionId: 2,
  //   });
  // });
});
