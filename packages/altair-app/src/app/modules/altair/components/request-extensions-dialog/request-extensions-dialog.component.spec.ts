import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { RequestExtensionsDialogComponent } from './request-extensions-dialog.component';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';

describe('RequestExtensionsDialogComponent', () => {
  let component: RequestExtensionsDialogComponent;
  let fixture: ComponentFixture<RequestExtensionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestExtensionsDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MockModule(SharedModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestExtensionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
