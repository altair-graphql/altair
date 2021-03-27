import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SmartInputBlockComponent } from './smart-input-block.component';
import { TranslateModule } from '@ngx-translate/core';
import { SmartInputModule } from '../smart-input.module';

describe('SmartInputBlockComponent', () => {
  let component: SmartInputBlockComponent;
  let fixture: ComponentFixture<SmartInputBlockComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SmartInputModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartInputBlockComponent);
    component = fixture.componentInstance;
    component.block = { content: '' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
