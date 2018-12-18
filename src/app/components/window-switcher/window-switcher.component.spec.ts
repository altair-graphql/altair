import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { SortablejsModule } from 'angular-sortablejs';
import { ContextMenuModule } from 'ngx-contextmenu';
import { WindowSwitcherComponent } from './window-switcher.component';
import { ClarityModule } from '@clr/angular';

describe('WindowSwitcherComponent', () => {
  let component: WindowSwitcherComponent;
  let fixture: ComponentFixture<WindowSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowSwitcherComponent ],
      imports: [
        ClarityModule,
        TranslateModule.forRoot(),
        SortablejsModule.forRoot({}),
        ContextMenuModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindowSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
