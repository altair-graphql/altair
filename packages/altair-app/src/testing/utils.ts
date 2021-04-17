import { DebugElement } from '@angular/core';
import { Component } from '@angular/core';
import { TestBed, TestModuleMetadata, ComponentFixture } from '@angular/core/testing';
import { IDictionary } from 'app/modules/altair/interfaces/shared';
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

export function setProps<C extends any>(fixture: ComponentFixture<C>, debugEl: DebugElement, valueObj: any = {}) {
  Object.keys(valueObj).forEach(key => {
    debugEl.componentInstance[key] = valueObj[key];
  });

  // await nextTick(fixture);
};

export function setValue<C extends any>(fixture: ComponentFixture<C>, debugEl: DebugElement, value: any = '') {
  const nativeElement: HTMLElement = debugEl.nativeElement;

  if (isInputElement(nativeElement)) {
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  } else {
    debugEl.triggerEventHandler('ngModelChange', value);
  }

  // await nextTick(fixture);
};

function getComponentMeta(compType: any) {
  const props = compType.__prop__metadata__ || {};
  const inputs: string[] = [];
  const outputs: string[] = [];

  Object.keys(props).forEach(prop => {
    const member = props[prop][0];
    if (member.ngMetadataName === 'Input') {
      inputs.push(prop);
    } else if (member.ngMetadataName === 'Output') {
      outputs.push(prop);
    }
  });

  return {
    inputs,
    outputs,
  };
}

export class BaseTestHostComponent {
  mock: IDictionary<{ calls: any[] }>;
  inputs: IDictionary;
  outputList: string[];
}

interface TestMountOptions extends TestModuleMetadata {
  component: any;
  propsData?: IDictionary;
}
export async function mount(mountOptions: TestMountOptions) {
  const MainComponent = mountOptions.component;
  const propsData = mountOptions.propsData || {};
  const props = getComponentMeta(MainComponent);
  const templateInputs = props.inputs.reduce((acc, cur) => {
    // Set initial props values
    return { ...acc, [cur]: propsData[cur] };
  }, {});
  const annotations = Reflect.getOwnPropertyDescriptor(MainComponent, '__annotations__')?.value[0];
  if (!annotations) {
    throw new Error(`Component does not have the @Component annotations!`);
  }
  const COMPONENT_TAG_NAME = annotations.selector;

  const template = buildTestHostComponentTemplate(COMPONENT_TAG_NAME, props.inputs, props.outputs);

  class X extends BaseTestHostComponent {
    mock = {};
    inputs = templateInputs;
    outputList = props.outputs;
  }
  props.outputs.forEach(prop => {
    // Set output listeners
    (X.prototype as any)[prop] = function(...args: any[]) {
      this.mock[prop] = this.mock[prop] || { calls: [] };
      this.mock[prop].calls.push(args);
    };
  });

  const TestHostComponent = Component({template: template})(X);

  const moduleDef: TestModuleMetadata = {
    ...mountOptions,
    declarations: [ ...(mountOptions.declarations || []), TestHostComponent, MainComponent ],
  };

  await TestBed.configureTestingModule(moduleDef).compileComponents();
  const testHostFixture = TestBed.createComponent(TestHostComponent);
  try {
    testHostFixture.detectChanges();
  } catch (error) {
    error.message = `There was an error while creating the test component.\n${error.message}`;
    throw error;
  }

  return new NgxTestWrapper<typeof MainComponent>(testHostFixture, MainComponent);
};

export function buildTestHostComponentTemplate(componentTagName: string, inputs: string[], outputs: string[]) {
  const inputTmpl = inputs.map(input => `[${input}]="inputs.${input}"`).join('\n');
  const outputTmpl = outputs.map(output => `(${output})="${output}($event)"`).join('\n');
  const template = `
    <div class="test-host">
      <${componentTagName}
        ${inputTmpl}

        ${outputTmpl}
      ></${componentTagName}>
    </div>
  `;
  return template;
}

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
