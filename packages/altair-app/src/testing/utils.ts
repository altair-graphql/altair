import 'reflect-metadata';
import { DebugElement, ɵReflectionCapabilities as ReflectionCapabilities, Component, ViewContainerRef, Signal, inject } from '@angular/core';
import {
  TestBed,
  TestModuleMetadata,
  ComponentFixture,
} from '@angular/core/testing';
import { IDictionary } from 'app/modules/altair/interfaces/shared';
import { NgxTestWrapper } from './wrapper';

export const flushPromises = () =>
  new Promise((resolve) => {
    if (typeof setImmediate === 'function') {
      return setImmediate(resolve);
    }

    return setTimeout(resolve);
  });

const isInputElement = (
  el: HTMLElement
): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement => {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
};

async function nextTick<C>(fixture: ComponentFixture<C>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

export function setProps<C>(
  fixture: ComponentFixture<C>,
  debugEl: DebugElement,
  valueObj: IDictionary = {}
) {
  Object.keys(valueObj).forEach((key) => {
    debugEl.componentInstance[key] = valueObj[key];
  });

  // await nextTick(fixture);
}

export function setValue<C>(
  fixture: ComponentFixture<C>,
  debugEl: DebugElement,
  value = ''
) {
  const nativeElement: HTMLElement = debugEl.nativeElement;

  if (isInputElement(nativeElement)) {
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  } else {
    debugEl.triggerEventHandler('ngModelChange', value);
  }

  // await nextTick(fixture);
}

function getComponentMeta(compType: any, propsData: IDictionary) {
  const rc = new ReflectionCapabilities();
  const props = compType.__prop__metadata__ || rc.ownPropMetadata(compType) || {};

  /**
   * All @Input inputs of the component
   */
  const normalInputs: string[] = [];

  /**
   * Inputs that are signals
   */
  const signalInputs: string[] = [];

  /**
   * Inputs that have values provided in propsData (i.e. passed to the mount function)
   * These are the inputs that will actually be set on the component instance in the test host component
   * to ensure that the input lifecycle is properly triggered.
   */
  const availableInputs: string[] = [];

  /**
   * All outputs of the component
   */
  const outputs: string[] = [];

  Object.keys(props).forEach((prop) => {
    const member = props[prop][0];
    if (member.ngMetadataName === 'Input') {
      // Check if it's a signal input
      if (member.isSignal) {
        signalInputs.push(prop);
      } else {
        normalInputs.push(prop);
      }
      if (typeof propsData[prop] !== 'undefined') {
        availableInputs.push(prop);
      }
      return;
    }
    if (member.ngMetadataName === 'Output') {
      outputs.push(prop);
      return;
    }
  });

  return {
    normalInputs,
    signalInputs,
    availableInputs,
    outputs,
  };
}

type ComponentMeta = ReturnType<typeof getComponentMeta>;

export class BaseTestHostComponent {
  mock!: IDictionary<{ calls: any[] }>;
  props!: ComponentMeta;
  inputs!: IDictionary;
  outputList!: string[];
}

type Ctor<C> = new (...args: any[]) => C;

type FilteredNonFunctionKeys<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? never : P;
}[keyof T];
type FilteredSignalKeys<T> = {
  [P in keyof T]: T[P] extends Signal<unknown> ? P : never;
}[keyof T];
export type AllowedPropsDataKeys<T> =
  | FilteredNonFunctionKeys<T>
  | FilteredSignalKeys<T>;
export type AllowedPropsDataValue<T, K extends keyof T> =
  T[K] extends Signal<infer U> ? U : T[K];
interface TestMountOptions<C = any> extends TestModuleMetadata {
  component: Ctor<C>;
  propsData?: Partial<{
    [K in AllowedPropsDataKeys<C>]-?: AllowedPropsDataValue<C, K>;
  }>;
}
export async function mount<C = any>(mountOptions: TestMountOptions<C>) {
  const MainComponent = mountOptions.component;
  const propsData = mountOptions.propsData || {};
  const props: ComponentMeta = getComponentMeta(MainComponent, propsData);
  const annotations = Reflect.getOwnPropertyDescriptor(
    MainComponent,
    '__annotations__'
  )?.value[0];
  if (!annotations) {
    throw new Error(`Component does not have the @Component annotations!`);
  }
  const COMPONENT_TAG_NAME = annotations.selector;

  const template = buildTestHostComponentTemplate(COMPONENT_TAG_NAME, props);

  @Component({
    selector: 'app-test-host',
    template: template,
    standalone: false,
  })
  class TestHostComponent extends BaseTestHostComponent {
    private viewContainerRef = inject(ViewContainerRef);

    mock = {};
    props = props;
    inputs: IDictionary;
    outputList = props.outputs;

    constructor() {
      super();
      // create the main component to retrieve default values to be applied to the actual component instance used for testing
      const componentRef = this.viewContainerRef.createComponent(MainComponent);
      const newTemplateInputs = [
        ...props.normalInputs,
        ...props.signalInputs,
      ].reduce((acc, cur) => {
        // Set default props values
        return {
          ...acc,
          [cur]:
            propsData[cur as keyof typeof propsData] ??
            props.signalInputs.includes(cur)
              ? (componentRef.instance as any)?.[cur]()
              : (componentRef.instance as any)?.[cur] ?? undefined,
        };
      }, {});
      this.inputs = newTemplateInputs;
      componentRef.destroy(); // component is no longer needed
    }
  }

  props.outputs.forEach((prop) => {
    // Set output listeners
    (TestHostComponent.prototype as any)[prop] = function (...args: unknown[]) {
      this.mock[prop] = this.mock[prop] || { calls: [] };
      this.mock[prop].calls.push(args);
    };
  });

  const moduleDef: TestModuleMetadata = {
    ...mountOptions,
    declarations: [
      ...(mountOptions.declarations || []),
      TestHostComponent,
      MainComponent,
    ],
  };

  await TestBed.configureTestingModule(moduleDef).compileComponents();
  const testHostFixture = TestBed.createComponent(TestHostComponent);
  try {
    testHostFixture.detectChanges();
  } catch (error) {
    (error as Error).message =
      `There was an error while creating the test component.\n${
        (error as Error).message
      }`;
    throw error;
  }

  return new NgxTestWrapper<C>(testHostFixture, MainComponent);
}

export function buildTestHostComponentTemplate(
  componentTagName: string,
  props: ComponentMeta
) {
  const inputTmpl = [...props.normalInputs, ...props.signalInputs]
    .map((input) => `[${input}]="inputs.${input}"`)
    .join('\n');
  const outputTmpl = props.outputs
    .map((output) => `(${output})="${output}($event)"`)
    .join('\n');
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
  left: { button: 0 },
  right: { button: 2 },
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}

export function testLog(...msgs: any[]) {
  require('console').log(...msgs);
}
