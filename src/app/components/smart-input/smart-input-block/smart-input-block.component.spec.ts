import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartInputBlockComponent } from './smart-input-block.component';

describe('SmartInputBlockComponent', () => {
  let component: SmartInputBlockComponent;
  let fixture: ComponentFixture<SmartInputBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartInputBlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartInputBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
