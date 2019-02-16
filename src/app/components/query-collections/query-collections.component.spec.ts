import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionsComponent } from './query-collections.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPopperModule } from 'ngx-popper';
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
        ClarityModule,
        TranslateModule.forRoot(),
        NgxPopperModule.forRoot(),
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
