import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsDialogComponent } from './teams-dialog.component';

describe('TeamsDialogComponent', () => {
  let component: TeamsDialogComponent;
  let fixture: ComponentFixture<TeamsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
