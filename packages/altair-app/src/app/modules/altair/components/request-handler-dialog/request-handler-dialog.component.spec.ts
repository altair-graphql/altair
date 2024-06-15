import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestHandlerDialogComponent } from './request-handler-dialog.component';
import { MockModule } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';

describe('RequestHandlerDialogComponent', () => {
  let component: RequestHandlerDialogComponent;
  let fixture: ComponentFixture<RequestHandlerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestHandlerDialogComponent],
      imports: [MockModule(SharedModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestHandlerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
