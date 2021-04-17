import { expect, it, beforeEach, describe } from '@jest/globals';
import { ComponentFixture, TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';

import { FancyInputComponent } from './fancy-input.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../modules/shared/shared.module';
import { MockModule } from 'ng-mocks';
import { Store } from '@ngrx/store';
import { mock, mockStoreFactory } from '../../../../../testing';
import { FancyInputMarkerComponent } from '../fancy-input-marker/fancy-input-marker.component';
import { EnvironmentService } from '../../services';

describe('FancyInputComponent', () => {
  let component: FancyInputComponent;
  let fixture: ComponentFixture<FancyInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FancyInputComponent, FancyInputMarkerComponent ],
      imports: [
        FormsModule,
        SharedModule,
      ],
      providers: [
        {
          provide: Store,
          useValue: mockStoreFactory(),
        },
        {
          provide: EnvironmentService,
          useValue: mock<EnvironmentService>({
            getActiveEnvironment: () => ({}),
            hydrate: () => '',
          }),
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FancyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set component value when input value changes', async() => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'some text';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement).toMatchSnapshot();
    expect(component.value).toBe('some text');
  });

  it('should render the highlights correctly based on the matched variables in text', async() => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'some text {{variable1}} then {{variable2}} is next';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should render mark element containing the matched variables in text', async() => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'some text {{variable1}} then {{variable2}} is next';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.detectChanges();

    const marks = fixture.nativeElement.querySelectorAll('mark');

    expect(marks.length).toBe(2);
    expect(marks[0].textContent).toBe('{{variable1}}');
    expect(marks[1].textContent).toBe('{{variable2}}');
  });
});
