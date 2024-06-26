import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ComponentModule } from '../../components/components.module';

import { QueryResultComponent } from './query-result.component';

describe('QueryResultComponent', () => {
  let component: QueryResultComponent;
  let fixture: ComponentFixture<QueryResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ComponentModule, TranslateModule.forRoot()],
      teardown: { destroyAfterEach: false },
    }).compileComponents();
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
