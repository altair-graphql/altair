import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DebugElement,
  EventEmitter,
  OutputEmitterRef,
  OutputRef,
  Type,
} from '@angular/core';
import {
  setValue,
  flushPromises,
  AllowedPropsDataKeys,
  AllowedPropsDataValue,
  ComponentMeta,
} from '../utils';
import { IDictionary } from '../../app/modules/altair/interfaces/shared';

type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

interface RootWrapperContext {
  meta: ComponentMeta;
  outputEmissions: IDictionary<{ calls: any[] }>;
}

export class NgxTestWrapper<C> {
  private _debugEl: DebugElement;
  private _rootContext?: RootWrapperContext;

  /**
   * @param fixture - The ComponentFixture for the component under test.
   * @param contextOrDebugEl - Either a RootWrapperContext (when created by mount())
   *   or a DebugElement (when created by find()/findAll() for child elements).
   */
  constructor(
    private _fixture: ComponentFixture<any>,
    contextOrDebugEl?: RootWrapperContext | DebugElement
  ) {
    if (contextOrDebugEl instanceof DebugElement) {
      this._debugEl = contextOrDebugEl;
    } else {
      this._debugEl = _fixture.debugElement;
      this._rootContext = contextOrDebugEl;
    }
  }

  private get _isRoot(): boolean {
    return !!this._rootContext;
  }

  get fx() {
    return this._fixture;
  }

  get component() {
    return this._debugEl;
  }

  get componentInstance() {
    return this._debugEl.componentInstance as C;
  }

  get debugElement() {
    return this._fixture.debugElement;
  }

  get element() {
    return this._debugEl.nativeElement;
  }

  exists() {
    return !!this._debugEl?.nativeNode;
  }

  find<SC = unknown>(selector: string) {
    const comp = this._debugEl.query(By.css(selector));
    return new NgxTestWrapper<SC>(this._fixture, comp);
  }

  findComponent<SC = unknown>(type: Type<any>) {
    const comp = this._debugEl.query(By.directive(type));
    return new NgxTestWrapper<SC>(this._fixture, comp);
  }

  findAll<SC = unknown>(selector: string) {
    return this._debugEl
      .queryAll(By.css(selector))
      .filter(Boolean)
      .map((comp) => new NgxTestWrapper<SC>(this._fixture, comp));
  }

  findAllComponents<SC = unknown>(type: Type<any>) {
    return this._debugEl
      .queryAll(By.directive(type))
      .filter(Boolean)
      .map((comp) => new NgxTestWrapper<SC>(this._fixture, comp));
  }

  emit(eventName: string, eventObj: any = null) {
    this.assertExists();
    return this.component.triggerEventHandler(eventName, eventObj);
  }

  emitted(): IDictionary<any[]> | undefined;
  emitted(
    event?: FilteredKeys<
      C,
      typeof EventEmitter | OutputEmitterRef<any> | OutputRef<any>
    >
  ): any[] | undefined;
  emitted(
    event?: FilteredKeys<
      C,
      typeof EventEmitter | OutputEmitterRef<any> | OutputRef<any>
    >
  ) {
    if (!this._rootContext) {
      return undefined;
    }

    const emitted = Object.entries(this._rootContext.outputEmissions)
      .filter(([_, data]) => data.calls && data.calls.length)
      .reduce(
        (acc: IDictionary<any[]>, [eventName, data]) => {
          acc[eventName] = data.calls;
          return acc;
        },
        {} as IDictionary<any[]>
      );

    if (event) {
      return emitted[event as any];
    }
    return emitted;
  }

  async setProps(
    valueObj: Partial<{
      [K in AllowedPropsDataKeys<C>]-?: AllowedPropsDataValue<C, K>;
    }> = {}
  ) {
    if (this._rootContext) {
      const { inputs } = this._rootContext.meta;
      for (const prop of Object.keys(valueObj)) {
        if (inputs.includes(prop)) {
          this._fixture.componentRef.setInput(prop, (valueObj as any)[prop]);
        }
      }
    }
    return this.nextTick();
  }

  setValue(value = '') {
    return setValue(this._debugEl, value);
  }

  text() {
    if (this.exists()) {
      return this._debugEl.nativeElement.innerText;
    }
    return '';
  }

  html() {
    if (this.exists()) {
      return this._debugEl.nativeElement.innerHTML;
    }
    return '';
  }

  props(key = '') {
    this.assertExists();
    if (key) {
      return this.component.properties[key];
    }
    return this.component.properties;
  }

  async nextTick() {
    this._fixture.detectChanges();
    TestBed.tick();
    await this._fixture.whenStable();
    await flushPromises();

    // Ensure that the fixture is stable after all changes
    this._fixture.detectChanges();
  }

  private assertExists() {
    if (!this.exists()) {
      throw new Error(`component does not exist.`);
    }
  }
}
