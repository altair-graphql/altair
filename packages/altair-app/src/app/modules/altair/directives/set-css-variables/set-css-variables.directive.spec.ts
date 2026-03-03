import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SetCssVariablesDirective } from './set-css-variables.directive';
import { IDictionary } from '../../interfaces/shared';
import { DirectivesModule } from '../index';

@Component({
  selector: 'app-test-host',
  template: '<div [appSetCssVariables]="cssVars"></div>',
  standalone: true,
  imports: [DirectivesModule],
})
class TestHostComponent {
  cssVars: IDictionary = {};
}

describe('SetCssVariablesDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let directive: SetCssVariablesDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(
      By.directive(SetCssVariablesDirective)
    );
    directive = debugEl.injector.get(SetCssVariablesDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should apply CSS variables from input', () => {
    fixture.componentInstance.cssVars = { '--test-color': '#ff0000' };
    fixture.detectChanges();
    expect(document.documentElement.style.getPropertyValue('--test-color')).toBe(
      '#ff0000'
    );
  });

  it('should remove CSS variable when value is empty', () => {
    document.documentElement.style.setProperty('--test-remove', '#00ff00');
    fixture.componentInstance.cssVars = { '--test-remove': '' };
    fixture.detectChanges();
    expect(document.documentElement.style.getPropertyValue('--test-remove')).toBe(
      ''
    );
  });

  it('should set multiple CSS variables', () => {
    fixture.componentInstance.cssVars = {
      '--var1': 'value1',
      '--var2': 'value2',
    };
    fixture.detectChanges();
    expect(document.documentElement.style.getPropertyValue('--var1')).toBe('value1');
    expect(document.documentElement.style.getPropertyValue('--var2')).toBe('value2');
  });
});
