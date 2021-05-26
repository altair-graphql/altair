import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Type } from '@angular/core';
import { setProps, setValue, BaseTestHostComponent } from '../utils';
import { IDictionary } from '../../app/modules/altair/interfaces/shared';

export class NgxTestWrapper<C extends any> {
  private _mainComponentDebugEl: DebugElement;
  private _isWrapper = false;

  constructor(
    private _testHostFixture: ComponentFixture<BaseTestHostComponent>,
    private _mainComponent?: any,
  ) {
    if (_mainComponent instanceof DebugElement) {
      this._mainComponentDebugEl = _mainComponent;
    } else {
      this._mainComponentDebugEl = _testHostFixture.debugElement.query(By.directive(_mainComponent));
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
    return !!this._mainComponentDebugEl.nativeNode;
  }

  find<SC extends any = unknown>(selector: string) {
    const comp = this._mainComponentDebugEl.query(By.css(selector));

    return new NgxTestWrapper<SC>(this._testHostFixture, comp || new DebugElement());
  }

  findComponent<SC extends any = unknown>(type: Type<any>) {
    const comp = this._mainComponentDebugEl.query(By.directive(type));

    return new NgxTestWrapper<SC>(this._testHostFixture, comp || new DebugElement());
  }

  findAll<SC extends any = unknown>(selector: string) {
    return this._mainComponentDebugEl.queryAll(By.css(selector))
      .filter(Boolean)
      .map(comp => new NgxTestWrapper<SC>(this._testHostFixture, comp || new DebugElement()));
  }

  findAllComponents<SC extends any = unknown>(type: Type<any>) {
    return this._mainComponentDebugEl.queryAll(By.directive(type))
      .filter(Boolean)
      .map(comp => new NgxTestWrapper<SC>(this._testHostFixture, comp));
  }

  emit(eventName: string, eventObj: any = null) {
    return this.component.triggerEventHandler(eventName, eventObj);
  }

  emitted(): IDictionary<any[]> | undefined;
  emitted(event: string): any[] | undefined;
  emitted(event?: string) {
    if (this._isWrapper) {
      const emitted = this._testHostFixture.componentInstance.outputList
        .map(prop => {
          return {
            event: prop,
            calls: (this._testHostFixture.componentInstance.mock[prop] || {}).calls,
          };
        })
        .filter(_ => _.calls && _.calls.length)
        .reduce((acc, cur) => {
          acc[cur.event] = cur.calls;
          return acc;
        }, {} as IDictionary<any[]>);

        if (event) {
          return emitted[event];
        }
        return emitted;
    }
  }

  setProps(valueObj: Partial<C> = {}) {
    if (this._isWrapper) {
      const componentInputs = Object.keys(this._testHostFixture.componentInstance.inputs);
      Object.keys(valueObj).forEach(prop => {
        if (componentInputs.includes(prop)) {
          // For component inputs (@input), we set the data on the test host itself, which would pass the value as input.
          // This is to properly trigger the full input lifecycle of the component.
          // Setting the input directly on the component instance would not do that.
          // TODO: Only set inputs where valueObj property is defined?
          this._testHostFixture.componentInstance.inputs[prop] = (valueObj as any)[prop];
        }
      });
      return setProps(this._testHostFixture, this._mainComponentDebugEl, valueObj);
    }
    return setProps(this._testHostFixture, this._mainComponentDebugEl, valueObj);
  }

  setValue(value: any = '') {
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
    await this._testHostFixture.whenStable();
  }

  private assertExists() {
    if (!this.exists()) {
      throw new Error(`component does not exists.`);
    }
  }
}
