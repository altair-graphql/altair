import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Predicate, Type } from '@angular/core';
import { setProps, setValue } from '../utils';

export class NgxTestWrapper<C extends any> {
  mainComponentDebugEl: DebugElement;

  constructor(
    private testHostFixture: ComponentFixture<any>,
    private mainComponent: any,
  ) {
    if (mainComponent instanceof DebugElement) {
      this.mainComponentDebugEl = mainComponent;
    } else {
      this.mainComponentDebugEl = testHostFixture.debugElement.query(By.directive(mainComponent));
    }
  }

  get fx() {
    return this.testHostFixture;
  }

  get component() {
    return this.mainComponentDebugEl;
  }

  get debugElement() {
    return this.testHostFixture.debugElement;
  }

  find(selector: string) {
    const comp = this.mainComponentDebugEl.query(By.css(selector));

    if (comp) {
      return new NgxTestWrapper(this.testHostFixture, comp);
    }
  }

  findComponent(type: Type<any>) {
    const comp = this.mainComponentDebugEl.query(By.directive(type));

    if (comp) {
      return new NgxTestWrapper(this.testHostFixture, comp);
    }
  }

  findAll(selector: string) {
    return this.mainComponentDebugEl.queryAll(By.css(selector))
      .map(comp => new NgxTestWrapper(this.testHostFixture, comp));
  }

  findAllComponents(type: Type<any>) {
    return this.mainComponentDebugEl.queryAll(By.directive(type))
      .map(comp => new NgxTestWrapper(this.testHostFixture, comp));
  }

  async setProps(valueObj: any = {}) {
    return setProps(this.testHostFixture, this.mainComponentDebugEl, valueObj);
  }

  async setValue(debugEl: DebugElement, value: any = '') {
    return setValue(this.testHostFixture, debugEl, value);
  }
}
