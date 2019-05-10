import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginElementComponent } from './plugin-element.component';

describe('PluginElementComponent', () => {
  let component: PluginElementComponent;
  let fixture: ComponentFixture<PluginElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PluginElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginElementComponent);
    component = fixture.componentInstance;
    component.plugin = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
