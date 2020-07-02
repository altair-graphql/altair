import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectionQueryDialogComponent } from './add-collection-query-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'app/modules/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddCollectionQueryDialogComponent', () => {
  let component: AddCollectionQueryDialogComponent;
  let fixture: ComponentFixture<AddCollectionQueryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCollectionQueryDialogComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        // CodemirrorModule,
        SharedModule,
        TranslateModule.forRoot(),
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
