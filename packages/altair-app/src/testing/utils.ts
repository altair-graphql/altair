import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

const isInputElement = (el: HTMLElement): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
  return (
    el instanceof HTMLInputElement
    || el instanceof HTMLSelectElement
    || el instanceof HTMLTextAreaElement
  );
};
const nextTick = async<C extends any>(fixture: ComponentFixture<C>) => {
  fixture.detectChanges();
  await fixture.whenStable();
};

export const setProps = async<C extends any>(fixture: ComponentFixture<C>, valueObj: any = {}) => {
  Object.keys(valueObj).forEach(key => {
    fixture.componentInstance[key] = valueObj[key];
  });

  await nextTick(fixture);
};

export const setValue = async<C extends any>(fixture: ComponentFixture<C>, debugEl: DebugElement, value: any = '') => {
  const nativeElement: HTMLElement = debugEl.nativeElement;

  if (isInputElement(nativeElement)) {
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  } else {
    debugEl.triggerEventHandler('ngModelChange', value);
  }

  await nextTick(fixture);
};

// TODO: Create test host component

/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left:  { button: 0 },
  right: { button: 2 }
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
 if (el instanceof HTMLElement) {
   el.click();
 } else {
   el.triggerEventHandler('click', eventObj);
 }
}
