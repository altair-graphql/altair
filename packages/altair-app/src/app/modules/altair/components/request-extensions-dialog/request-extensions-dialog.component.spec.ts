import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestExtensionsDialogComponent } from './request-extensions-dialog.component';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';

describe('RequestExtensionsDialogComponent', () => {
  let component: RequestExtensionsDialogComponent;
  let fixture: ComponentFixture<RequestExtensionsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestExtensionsDialogComponent],
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
