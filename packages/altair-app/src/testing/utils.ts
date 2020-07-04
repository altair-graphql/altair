import { DebugElement } from '@angular/core';
import { Component } from '@angular/core';
import { TestBed, TestModuleMetadata, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxTestWrapper } from './wrapper';

const isInputElement = (el: HTMLElement): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
  return (
    el instanceof HTMLInputElement
    || el instanceof HTMLSelectElement
    || el instanceof HTMLTextAreaElement
  );
};
async function nextTick<C extends any>(fixture: ComponentFixture<C>) {
  fixture.detectChanges();
  await fixture.whenStable();
};

export async function setProps<C extends any>(fixture: ComponentFixture<C>, debugEl: DebugElement, valueObj: any = {}) {
  Object.keys(valueObj).forEach(key => {
    debugEl.componentInstance[key] = valueObj[key];
  });

  await nextTick(fixture);
};

export async function setValue<C extends any>(fixture: ComponentFixture<C>, debugEl: DebugElement, value: any = '') {
  const nativeElement: HTMLElement = debugEl.nativeElement;

  if (isInputElement(nativeElement)) {
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  } else {
    debugEl.triggerEventHandler('ngModelChange', value);
  }

  await nextTick(fixture);
};


export async function mount(testData: TestModuleMetadata, MainComponent: any) {
  const annotations = Reflect.getOwnPropertyDescriptor(MainComponent, '__annotations__')?.value[0];
  if (!annotations) {
    throw new Error(`Component does not have the @Component annotations!`);
  }
  const COMPONENT_TAG_NAME = annotations.selector;

  const template = `
    <div class="test-host">
      <${COMPONENT_TAG_NAME}></${COMPONENT_TAG_NAME}>
    </div>
  `;

  const TestHostComponent = Component({template: template})(class {});
  // const TmpModule = NgModule({declarations: [TestHostComponent]})(class TestHostModule {});
  // const factories = await compiler.compileModuleAndAllComponentsAsync(tmpModule);
  // const f = factories.componentFactories[0];
  // const cmpRef = this.vc.createComponent(f);
  // cmpRef.instance.name = 'dynamic';
  const moduleDef: TestModuleMetadata = {
    ...testData,
    declarations: [ ...(testData.declarations || []), TestHostComponent, MainComponent ],
  };
  await TestBed.configureTestingModule(moduleDef).compileComponents();
  const testHostFixture = TestBed.createComponent(TestHostComponent);
  testHostFixture.detectChanges();

  return new NgxTestWrapper(testHostFixture, MainComponent);
};

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
