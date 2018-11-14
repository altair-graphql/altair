import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCurlDialogComponent } from './import-curl-dialog.component';

import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';

import * as services from '../../services';

describe('ImportCurlDialogComponent', () => {
  let component: ImportCurlDialogComponent;
  let fixture: ComponentFixture<ImportCurlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCurlDialogComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        ClarityModule,
        TranslateModule.forRoot()
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCurlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
