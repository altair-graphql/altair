import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QueryRevisionDialogComponent } from './query-revision-dialog.component';
import { MockModule, MockProviders } from 'ng-mocks';
import { SharedModule } from '../../modules/shared/shared.module';
import { ApiService } from '../../services';

describe('QueryRevisionDialogComponent', () => {
  let component: QueryRevisionDialogComponent;
  let fixture: ComponentFixture<QueryRevisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryRevisionDialogComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MockModule(SharedModule)],
      providers: [MockProviders(ApiService)],
    }).compileComponents();

    fixture = TestBed.createComponent(QueryRevisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
