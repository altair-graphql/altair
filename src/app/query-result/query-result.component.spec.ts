import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';

import { QueryResultComponent } from './query-result.component';

describe('QueryResultComponent', () => {
  let component: QueryResultComponent;
  let fixture: ComponentFixture<QueryResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryResultComponent ],
      imports: [ FormsModule, CodemirrorModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
