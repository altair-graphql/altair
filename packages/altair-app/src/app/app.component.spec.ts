import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { AppComponent } from './app.component';

// Create a minimal test that avoids importing AltairModule (which contains BrowserModule)
// The builder's init-testbed already loads BrowserTestingModule, so importing BrowserModule
// again causes NG05100.
describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      teardown: { destroyAfterEach: false },
    })
      .overrideComponent(AppComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
