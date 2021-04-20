import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SmartInputComponent } from './smart-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { SmartInputModule } from '../smart-input.module';

describe('SmartInputComponent', () => {
  let component: SmartInputComponent;
  let fixture: ComponentFixture<SmartInputComponent>;

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
    fixture = TestBed.createComponent(SmartInputComponent);
    component = fixture.componentInstance;
    component.state = {
      lines: [
        { blocks: [] }
      ]
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
