import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionsComponent } from './query-collections.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';
import { ClarityModule } from 'clarity-angular';
import { TranslateModule } from '@ngx-translate/core';
import { QueryCollectionItemComponent } from '../query-collection-item/query-collection-item.component';

describe('QueryCollectionsComponent', () => {
  let component: QueryCollectionsComponent;
  let fixture: ComponentFixture<QueryCollectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionsComponent, QueryCollectionItemComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        ClarityModule.forRoot(),
        TranslateModule.forRoot()
      ]
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
