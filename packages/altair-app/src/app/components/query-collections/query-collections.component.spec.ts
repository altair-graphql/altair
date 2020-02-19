import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionsComponent } from './query-collections.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPopperModule } from 'ngx-popper';
import { SharedModule } from 'app/modules/shared/shared.module';
import { QueryCollectionItemComponent } from '../query-collection-item/query-collection-item.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('QueryCollectionsComponent', () => {
  let component: QueryCollectionsComponent;
  let fixture: ComponentFixture<QueryCollectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionsComponent, QueryCollectionItemComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        CodemirrorModule,
        SharedModule,
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
