import { trigger, transition, style, animate } from '@angular/animations';

export const fadeInOutAnimationTrigger = trigger('fadeInOutAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('.3s ease', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    style({ opacity: 1 }),
    animate('.3s ease', style({ opacity: 0 })),
  ]),
]);
export const fadeGridGrowInOutAnimationTrigger = trigger(
  'fadeGridGrowInOutAnimation',
  [
    transition(':enter', [
      style({ opacity: 0, gridTemplateRows: '0fr' }),
      animate('.3s ease', style({ opacity: 1, gridTemplateRows: '1fr' })),
    ]),
    transition(':leave', [
      style({ opacity: 1, gridTemplateRows: '1fr' }),
      animate('.3s ease', style({ opacity: 0, gridTemplateRows: '0fr' })),
    ]),
  ]
);
