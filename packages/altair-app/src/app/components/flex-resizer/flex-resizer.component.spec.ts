import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexResizerComponent } from './flex-resizer.component';
import { SharedModule } from 'app/modules/shared/shared.module';

describe('FlexResizerComponent', () => {
  let component: FlexResizerComponent;
  let fixture: ComponentFixture<FlexResizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexResizerComponent ],
      imports: [
        SharedModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexResizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
