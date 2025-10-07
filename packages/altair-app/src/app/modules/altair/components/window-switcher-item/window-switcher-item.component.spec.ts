import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindowSwitcherItemComponent } from './window-switcher-item.component';

describe('WindowSwitcherItemComponent', () => {
  let component: WindowSwitcherItemComponent;
  let fixture: ComponentFixture<WindowSwitcherItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WindowSwitcherItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSwitcherItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
