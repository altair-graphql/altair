import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryRevisionDialogComponent } from './query-revision-dialog.component';

describe('QueryRevisionDialogComponent', () => {
  let component: QueryRevisionDialogComponent;
  let fixture: ComponentFixture<QueryRevisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryRevisionDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QueryRevisionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
