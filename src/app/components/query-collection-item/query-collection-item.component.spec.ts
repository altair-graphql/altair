import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionItemComponent } from './query-collection-item.component';

describe('QueryCollectionItemComponent', () => {
  let component: QueryCollectionItemComponent;
  let fixture: ComponentFixture<QueryCollectionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryCollectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
