import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MockModule, MockProvider } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { AccountService, NotifyService } from '../../services';

import { TeamsDialogComponent } from './teams-dialog.component';
import { Store } from '@ngrx/store';

describe('TeamsDialogComponent', () => {
  let component: TeamsDialogComponent;
  let fixture: ComponentFixture<TeamsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamsDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        MockProvider(AccountService),
        MockProvider(NotifyService),
        MockProvider(Store),
      ],
      imports: [MockModule(SharedModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
