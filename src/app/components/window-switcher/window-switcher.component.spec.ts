import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { SortablejsModule } from 'ngx-sortablejs';
import { ContextMenuModule } from 'ngx-contextmenu';
import { WindowSwitcherComponent } from './window-switcher.component';
import { SharedModule } from 'app/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AltairConfig } from 'app/config';

describe('WindowSwitcherComponent', () => {
  let component: WindowSwitcherComponent;
  let fixture: ComponentFixture<WindowSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindowSwitcherComponent ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        TranslateModule.forRoot(),
        SortablejsModule.forRoot({}),
        ContextMenuModule.forRoot()
      ],
      providers: [
        {
          provide: AltairConfig,
          useValue: new AltairConfig(),
        },
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
