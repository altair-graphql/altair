import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, EventEmitter, OutputEmitterRef, Type } from '@angular/core';
import {
  setProps,
  setValue,
  BaseTestHostComponent,
  flushPromises,
  AllowedPropsDataKeys,
  AllowedPropsDataValue,
  testLog,
} from '../utils';
import { IDictionary } from '../../app/modules/altair/interfaces/shared';

type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

export class NgxTestWrapper<C> {
  private _mainComponentDebugEl: DebugElement;
  private _isWrapper = false;

  constructor(
    private _testHostFixture: ComponentFixture<BaseTestHostComponent>,
    private _mainComponent?: any
  ) {
    if (_mainComponent instanceof DebugElement) {
      this._mainComponentDebugEl = _mainComponent;
    } else {
      this._mainComponentDebugEl = _testHostFixture.debugElement.query(
        By.directive(_mainComponent)
      );
      this._isWrapper = true;
    }
  }

  get fx() {
    return this._testHostFixture;
  }

  get component() {
    return this._mainComponentDebugEl;
  }

  get componentInstance() {
    return this._mainComponentDebugEl.componentInstance as C;
  }

  get debugElement() {
    return this._testHostFixture.debugElement;
  }

  get element() {
    return this._mainComponentDebugEl.nativeElement;
  }

  exists() {
    return !!this._mainComponentDebugEl?.nativeNode;
  }

  find<SC = unknown>(selector: string) {
    const comp = this._mainComponentDebugEl.query(By.css(selector));

    return new NgxTestWrapper<SC>(this._testHostFixture, comp);
  }

  findComponent<SC = unknown>(type: Type<any>) {
    const comp = this._mainComponentDebugEl.query(By.directive(type));

    return new NgxTestWrapper<SC>(this._testHostFixture, comp);
  }

  findAll<SC = unknown>(selector: string) {
    return this._mainComponentDebugEl
      .queryAll(By.css(selector))
      .filter(Boolean)
      .map((comp) => new NgxTestWrapper<SC>(this._testHostFixture, comp));
  }

  findAllComponents<SC = unknown>(type: Type<any>) {
    return this._mainComponentDebugEl
      .queryAll(By.directive(type))
      .filter(Boolean)
      .map((comp) => new NgxTestWrapper<SC>(this._testHostFixture, comp));
  }

  emit(eventName: string, eventObj: any = null) {
    this.assertExists();
    return this.component.triggerEventHandler(eventName, eventObj);
  }

  emitted(): IDictionary<any[]> | undefined;
  emitted(
    event?: FilteredKeys<C, typeof EventEmitter | OutputEmitterRef<any>>
  ): any[] | undefined;
  emitted(event?: FilteredKeys<C, typeof EventEmitter | OutputEmitterRef<any>>) {
    if (this._isWrapper) {
      const emitted = this._testHostFixture.componentInstance.outputList
        .map((prop) => {
          return {
            event: prop,
            calls: (this._testHostFixture.componentInstance.mock[prop] || {}).calls,
          };
        })
        .filter((_) => _.calls && _.calls.length)
        .reduce(
          (acc, cur) => {
            acc[cur.event] = cur.calls!;
            return acc;
          },
          {} as IDictionary<any[]>
        );

      if (event) {
        return emitted[event as any];
      }
      return emitted;
    }
  }

  async setProps(
    valueObj: Partial<{
      [K in AllowedPropsDataKeys<C>]-?: AllowedPropsDataValue<C, K>;
    }> = {}
  ) {
    if (this._isWrapper) {
      const componentInputs = Object.keys(
        this._testHostFixture.componentInstance.inputs
      );
      Object.keys(valueObj).forEach((prop) => {
        if (componentInputs.includes(prop)) {
          // testLog('....', this._testHostFixture.componentInstance.inputs, valueObj);
          // For component inputs (@input), we set the data on the test host itself, which would pass the value as input.
          // This is to properly trigger the full input lifecycle of the component.
          // Setting the input directly on the component instance would not do that.
          // TODO: Only set inputs where valueObj property is defined?
          this._testHostFixture.componentInstance.inputs[prop] = (valueObj as any)[
            prop
          ];
        }
      });
      return this.nextTick();
      // return setProps(this._testHostFixture, this._mainComponentDebugEl, valueObj);
    }
    testLog('..not a wrapper', valueObj);
    setProps(this._testHostFixture, this._mainComponentDebugEl, valueObj);
    return this.nextTick();
  }

  setValue(value = '') {
    return setValue(this._testHostFixture, this._mainComponentDebugEl, value);
  }

  text() {
    if (this.exists()) {
      return this.component.nativeElement.innerText;
    }
    return '';
  }

  html() {
    if (this.exists()) {
      return this.component.nativeElement.innerHTML;
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
    this._testHostFixture.detectChanges();
    TestBed.tick();
    await this._testHostFixture.whenStable();
    await flushPromises();

    // Ensure that the fixture is stable after all changes
    this._testHostFixture.detectChanges();
  }

  private assertExists() {
    if (!this.exists()) {
      throw new Error(`component does not exists.`);
    }
  }
}
