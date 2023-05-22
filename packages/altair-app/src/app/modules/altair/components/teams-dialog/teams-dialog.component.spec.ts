import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockProvider } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { AccountService, NotifyService } from '../../services';

import { TeamsDialogComponent } from './teams-dialog.component';

describe('TeamsDialogComponent', () => {
  let component: TeamsDialogComponent;
  let fixture: ComponentFixture<TeamsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamsDialogComponent],
      providers: [MockProvider(AccountService), MockProvider(NotifyService)],
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
