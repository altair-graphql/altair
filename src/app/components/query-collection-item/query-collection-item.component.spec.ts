import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCollectionItemComponent } from './query-collection-item.component';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

describe('QueryCollectionItemComponent', () => {
  let component: QueryCollectionItemComponent;
  let fixture: ComponentFixture<QueryCollectionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryCollectionItemComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
        ClarityModule,
        TranslateModule.forRoot()
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
