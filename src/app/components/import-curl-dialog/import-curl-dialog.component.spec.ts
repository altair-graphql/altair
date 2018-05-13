import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCurlDialogComponent } from './import-curl-dialog.component';

describe('ImportCurlDialogComponent', () => {
  let component: ImportCurlDialogComponent;
  let fixture: ComponentFixture<ImportCurlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCurlDialogComponent ]
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
