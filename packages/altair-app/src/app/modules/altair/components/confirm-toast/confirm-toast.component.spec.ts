import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastPackage, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmToastComponent } from './confirm-toast.component';

const mockToastPackage = {
  triggerAction: vi.fn(),
  toastId: 1,
  message: 'test',
  title: 'test',
  duplicatesCount: 0,
  config: { 
  timeOut: 0, 
  extendedTimeOut: 0,
  toastClass: 'ngx-toastr',
  titleClass: 'toast-title',
  messageClass: 'toast-message',
  easing: 'ease-in',
  easeTime: 300,
  enableHtml: false,
  progressBar: false,
  toastComponent: ConfirmToastComponent,
},
  onAction: () => new Subject(),
  toastRef: {
    afterActivate: () => new Subject(),
    manualClosed: () => new Subject(),
    timeoutReset: () => new Subject(),
    countDuplicate: () => new Subject(),
  },
} as unknown as ToastPackage;

const mockToastrService = {
  toasts: [],
  remove: vi.fn(),
} as unknown as ToastrService;

describe('ConfirmToastComponent', () => {
  let component: ConfirmToastComponent;
  let fixture: ComponentFixture<ConfirmToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmToastComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
  provideNoopAnimations(),
  { provide: ToastPackage, useValue: mockToastPackage },
  { provide: ToastrService, useValue: mockToastrService },
],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should stop event propagation when action is called', () => {
    const event = new Event('click');
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    component.action(event);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('should return false when action is called', () => {
    const event = new Event('click');
    const result = component.action(event);
    expect(result).toBe(false);
  });

  it('should trigger toast action when action is called', () => {
    const event = new Event('click');
    component.action(event);
    expect(mockToastPackage.triggerAction).toHaveBeenCalled();
  });
});