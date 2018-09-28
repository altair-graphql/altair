import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionsComponent } from './query-collections.component';

describe('QueryCollectionsComponent', () => {
  let component: QueryCollectionsComponent;
  let fixture: ComponentFixture<QueryCollectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
