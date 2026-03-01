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
  setProps,
  setValue,
  flushPromises,
  AllowedPropsDataKeys,
  AllowedPropsDataValue,
  ComponentMeta,
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
    private _fixture: ComponentFixture<any>,
    private _mainComponent?: any,
    private _props?: ComponentMeta,
    private _outputEmissions?: IDictionary<{ calls: any[] }>
  ) {
    if (_mainComponent instanceof DebugElement) {
      // When used for child wrappers via find()/findAll()
      this._mainComponentDebugEl = _mainComponent;
    } else if (_mainComponent) {
      // When used for the root wrapper created by mount().
      // With TestBed.createComponent(Component), fixture.debugElement is the
      // component's host element directly. No need to query for it.
      this._mainComponentDebugEl = _fixture.debugElement;
      this._isWrapper = true;
    } else {
      this._mainComponentDebugEl = _fixture.debugElement;
      this._isWrapper = true;
    }
  }

  get fx() {
    return this._fixture;
  }

  get component() {
    return this._mainComponentDebugEl;
  }

  get componentInstance() {
    return this._mainComponentDebugEl.componentInstance as C;
  }

  get debugElement() {
    return this._fixture.debugElement;
  }

  get element() {
    return this._mainComponentDebugEl.nativeElement;
  }

  exists() {
    return !!this._mainComponentDebugEl?.nativeNode;
  }

  find<SC = unknown>(selector: string) {
    const comp = this._mainComponentDebugEl.query(By.css(selector));

    return new NgxTestWrapper<SC>(this._fixture, comp);
  }

  findComponent<SC = unknown>(type: Type<any>) {
    const comp = this._mainComponentDebugEl.query(By.directive(type));

    return new NgxTestWrapper<SC>(this._fixture, comp);
  }

  findAll<SC = unknown>(selector: string) {
    return this._mainComponentDebugEl
      .queryAll(By.css(selector))
      .filter(Boolean)
      .map((comp) => new NgxTestWrapper<SC>(this._fixture, comp));
  }

  findAllComponents<SC = unknown>(type: Type<any>) {
    return this._mainComponentDebugEl
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
    if (this._isWrapper && this._outputEmissions) {
      const emitted = Object.entries(this._outputEmissions)
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
  }

  async setProps(
    valueObj: Partial<{
      [K in AllowedPropsDataKeys<C>]-?: AllowedPropsDataValue<C, K>;
    }> = {}
  ) {
    if (this._isWrapper && this._props) {
      const allInputs = [
        ...this._props.normalInputs,
        ...this._props.signalInputs,
      ];
      Object.keys(valueObj).forEach((prop) => {
        if (allInputs.includes(prop)) {
          // Use ComponentRef.setInput() to properly trigger input lifecycle
          this._fixture.componentRef.setInput(prop, (valueObj as any)[prop]);
        }
      });
      return this.nextTick();
    }
    testLog('..not a wrapper', valueObj);
    setProps(this._fixture, this._mainComponentDebugEl, valueObj);
    return this.nextTick();
  }

  setValue(value = '') {
    return setValue(this._fixture, this._mainComponentDebugEl, value);
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
    this._fixture.detectChanges();
    TestBed.tick();
    await this._fixture.whenStable();
    await flushPromises();

    // Ensure that the fixture is stable after all changes
    this._fixture.detectChanges();
  }

  private assertExists() {
    if (!this.exists()) {
      throw new Error(`component does not exists.`);
    }
  }
}
