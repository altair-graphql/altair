import { Directive, ElementRef, effect, input, inject } from '@angular/core';
import { IDictionary } from '../../interfaces/shared';

@Directive({
  selector: '[appSetCssVariables]',
  standalone: false,
})
export class SetCssVariablesDirective {
  private element = inject(ElementRef);

  readonly appSetCssVariables = input<IDictionary>({});

  constructor() {
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
