import { expect } from '@jest/globals';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/modules/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AddCollectionQueryDialogComponent', () => {
  let component: AddCollectionQueryDialogComponent;
  let fixture: ComponentFixture<AddCollectionQueryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCollectionQueryDialogComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        SharedModule,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCollectionQueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should render correctly with [showDialog]', () => {
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should set showDialog on app-dialog with [showDialog]', async() => {
    const appDialog = fixture.debugElement.query(By.css('app-dialog'));
    component.showDialog = true;
    fixture.detectChanges();

    expect(appDialog.properties.showDialog).toBe(true);
  });

  it('should render correctly with [windowTitle]', async() => {
    component.windowTitle = 'my title';
    component.ngOnChanges({
      windowTitle: new SimpleChange(null, component.windowTitle, true)
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should render [windowTitle] in input', async() => {
    component.windowTitle = 'my title';
    component.ngOnChanges({
      windowTitle: new SimpleChange(null, component.windowTitle, true)
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.debugElement.query(By.css('[data-test-id="collection-query-name"]'));

    expect(input.nativeElement.value).toBe('my title');
  });

  it('should render correctly with [collections]', async() => {
    component.collections = [
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
    ];
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement).toMatchSnapshot();
  });
});
