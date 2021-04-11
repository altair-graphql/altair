import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForkRepoComponent } from './fork-repo.component';

describe('ForkRepoComponent', () => {
  let component: ForkRepoComponent;
  let fixture: ComponentFixture<ForkRepoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForkRepoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForkRepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
