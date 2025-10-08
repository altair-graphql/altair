import { Directive, ElementRef, effect, input } from '@angular/core';
import { IDictionary } from '../../interfaces/shared';

@Directive({
  selector: '[appSetCssVariables]',
  standalone: false,
})
export class SetCssVariablesDirective {
  readonly appSetCssVariables = input<IDictionary>({});

  constructor(private element: ElementRef) {
    effect(() => {
      const appSetCssVariables = this.appSetCssVariables();
      if (appSetCssVariables) {
        Object.keys(appSetCssVariables).forEach((variable) => {
          if (appSetCssVariables[variable]) {
            document.documentElement.style.setProperty(
              variable,
              appSetCssVariables[variable]
            );
          } else {
            document.documentElement.style.removeProperty(variable);
          }
        });
      }
    });
  }
}
