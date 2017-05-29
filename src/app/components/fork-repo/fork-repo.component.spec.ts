import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForkRepoComponent } from './fork-repo.component';

describe('ForkRepoComponent', () => {
  let component: ForkRepoComponent;
  let fixture: ComponentFixture<ForkRepoComponent>;

  beforeEach(async(() => {
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
