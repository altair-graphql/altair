import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Type } from '@angular/core';
import { setProps, setValue, BaseTestHostComponent } from '../utils';
import { IDictionary } from 'app/interfaces/shared';

export class NgxTestWrapper<C extends any> {
  private _mainComponentDebugEl: DebugElement;
  private _isWrapper = false;

  constructor(
    private _testHostFixture: ComponentFixture<BaseTestHostComponent>,
    private _mainComponent: any,
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
    return !!this._mainComponentDebugEl;
  }

  find(selector: string) {
    const comp = this._mainComponentDebugEl.query(By.css(selector));

    return new NgxTestWrapper(this._testHostFixture, comp);
  }

  findComponent(type: Type<any>) {
    const comp = this._mainComponentDebugEl.query(By.directive(type));

    if (comp) {
      return new NgxTestWrapper(this._testHostFixture, comp);
    }
  }

  findAll(selector: string) {
    return this._mainComponentDebugEl.queryAll(By.css(selector))
      .map(comp => new NgxTestWrapper(this._testHostFixture, comp));
  }

  findAllComponents(type: Type<any>) {
    return this._mainComponentDebugEl.queryAll(By.directive(type))
      .map(comp => new NgxTestWrapper(this._testHostFixture, comp));
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
          this._testHostFixture.componentInstance.inputs[prop] = valueObj[prop];
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
    if (key) {
      return this.component.properties[key];
    }
    return this.component.properties;
  }

  async nextTick() {
    this._testHostFixture.detectChanges();
    await this._testHostFixture.whenStable();
  }
}
