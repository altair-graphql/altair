import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import { EditCollectionDialogComponent } from './edit-collection-dialog.component';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditCollectionDialogComponent', () => {
  let component: EditCollectionDialogComponent;
  let fixture: ComponentFixture<EditCollectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCollectionDialogComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        CodemirrorModule,
        ClarityModule,
        TranslateModule.forRoot()
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
