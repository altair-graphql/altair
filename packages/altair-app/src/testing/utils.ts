import {
  DebugElement,
  reflectComponentType,
  OutputRef,
  Signal,
} from '@angular/core';
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

export function setValue(debugEl: DebugElement, value = '') {
  const nativeElement: HTMLElement = debugEl.nativeElement;

  if (isInputElement(nativeElement)) {
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));
  } else {
    debugEl.triggerEventHandler('ngModelChange', value);
  }
}

/**
 * Use the public `reflectComponentType()` API to get component metadata.
 * Returns a flat list of all input names and output names.
 */
export function getComponentMeta(compType: any) {
  const mirror = reflectComponentType(compType);
  if (!mirror) {
    throw new Error(
      `Could not reflect component type. Ensure the class has the @Component decorator.`
    );
  }

  const inputs: string[] = [];
  const outputs: string[] = [];

  for (const inp of mirror.inputs) {
    inputs.push(inp.propName);
  }

  for (const out of mirror.outputs) {
    outputs.push(out.propName);
  }

  return { inputs, outputs };
}

export type ComponentMeta = ReturnType<typeof getComponentMeta>;

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

/**
 * Mount a component for testing using Angular's public APIs.
 *
 * Uses `reflectComponentType()` for metadata introspection,
 * `ComponentRef.setInput()` for setting inputs,
 * and `OutputRef.subscribe()` for capturing output emissions.
 */
export async function mount<C = any>(mountOptions: TestMountOptions<C>) {
  const MainComponent = mountOptions.component;
  const propsData: Record<string, unknown> = mountOptions.propsData ?? {};
  const meta = getComponentMeta(MainComponent);

  const moduleDef: TestModuleMetadata = {
    ...mountOptions,
    declarations: [...(mountOptions.declarations || []), MainComponent],
  };

  await TestBed.configureTestingModule(moduleDef).compileComponents();
  const fixture = TestBed.createComponent(MainComponent);

  // Set inputs using the public ComponentRef.setInput() API.
  // This properly triggers the Angular input lifecycle for both
  // decorator-based @Input and signal-based input().
  for (const inputName of meta.inputs) {
    if (typeof propsData[inputName] !== 'undefined') {
      fixture.componentRef.setInput(inputName, propsData[inputName]);
    }
  }

  // Subscribe to outputs to capture emissions.
  // OutputRef.subscribe() works with signal-based output(), outputFromObservable(),
  // and EventEmitter (which implements OutputRef).
  const outputEmissions: IDictionary<{ calls: any[] }> = {};
  for (const outputName of meta.outputs) {
    const outputRef = (fixture.componentInstance as any)[
      outputName
    ] as OutputRef<unknown>;
    if (outputRef && typeof outputRef.subscribe === 'function') {
      outputEmissions[outputName] = { calls: [] };
      outputRef.subscribe((value: unknown) => {
        outputEmissions[outputName]!.calls.push([value]);
      });
    }
  }

  try {
    fixture.detectChanges();
  } catch (error) {
    (error as Error).message =
      `There was an error while creating the test component.\n${
        (error as Error).message
      }`;
    throw error;
  }

  return new NgxTestWrapper<C>(fixture as ComponentFixture<any>, {
    meta,
    outputEmissions,
  });
}
