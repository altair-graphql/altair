import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionItemComponent } from './query-collection-item.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPopperModule } from 'ngx-popper';
import { SharedModule } from 'app/shared/shared.module';

describe('QueryCollectionItemComponent', () => {
  let component: QueryCollectionItemComponent;
  let fixture: ComponentFixture<QueryCollectionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionItemComponent ],
      imports: [
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
    fixture = TestBed.createComponent(QueryCollectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
