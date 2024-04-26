import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestExtensionsDialogComponent } from './request-extensions-dialog.component';

describe('RequestExtensionsDialogComponent', () => {
  let component: RequestExtensionsDialogComponent;
  let fixture: ComponentFixture<RequestExtensionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestExtensionsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestExtensionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
